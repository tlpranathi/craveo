/**
 * One-off script: fill in `image` for every Restaurant and Menu item.
 *
 * Pipeline per document:
 *   1. search Pexels for a matching stock photo
 *   2. upload it to Cloudinary (resized, so we never hotlink Pexels)
 *   3. save the Cloudinary URL on the document
 *
 * Run from /backend:
 *   npm run add-images -- --dry-run --limit=20   # preview matches, writes nothing
 *   npm run add-images                            # real run (skips docs that already have an image)
 *
 * Flags:
 *   --dry-run            search + print matches only; no Cloudinary upload, no DB writes
 *   --only=restaurants   or --only=menu
 *   --limit=N            process at most N docs per collection
 *   --force              also overwrite docs that already have an image
 *
 * Required in backend/.env:
 *   MONGO_URI, PEXELS_API_KEY,
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * Safe to re-run: docs that already have an image are skipped, Cloudinary
 * uploads are keyed by Pexels photo id (never duplicated), and if Pexels rate
 * limits us (200 req/hour) the script stops cleanly so you can resume later.
 */
const path = require("path")
const fs = require("fs")
require("dotenv").config({ path: path.resolve(__dirname, "../.env") })
const mongoose = require("mongoose")
const cloudinary = require("cloudinary").v2
const Restaurant = require("../models/Restaurant")
const Menu = require("../models/Menu")

// ---------- CLI flags ----------
const args = process.argv.slice(2)
const hasFlag = (name) => args.includes(`--${name}`)
const getOpt = (name) => {
  const a = args.find((x) => x.startsWith(`--${name}=`))
  return a ? a.split("=")[1] : null
}
const DRY_RUN = hasFlag("dry-run")
const FORCE = hasFlag("force")
const ONLY = getOpt("only") // "restaurants" | "menu" | null
const LIMIT = getOpt("limit") ? parseInt(getOpt("limit"), 10) : 0 // 0 = no limit

// ---------- small helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// deterministic pick so re-runs choose the same photo for the same doc
function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
function pickByHash(list, id) {
  if (!list.length) return null
  return list[hashString(String(id)) % list.length]
}

// "North Indian, Chinese" -> "north indian"
function primaryCuisine(cuisine) {
  if (!cuisine) return ""
  return cuisine.split(/[,/&]/)[0].trim().toLowerCase()
}

// words that say nothing about what the dish looks like
const STOP_WORDS = new Set([
  "with", "and", "the", "special", "combo", "plate", "meal", "regular", "large",
  "small", "half", "full", "extra", "style", "mini", "jumbo", "fresh", "hot", "cold",
])

// "Paneer Butter Masala (Full)" -> ["paneer", "butter", "masala"]
function dishTokens(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t))
}

// crude singularisation so "fries" matches "fry", "noodles" matches "noodle"
const stem = (t) => t.replace(/(ies|es|s)$/, "")

/**
 * Pexels photos carry an `alt` description. We only accept a photo as a real
 * match if that description mentions enough of the dish's words - otherwise
 * we'd happily put a random plate of pasta on a "kadai paneer".
 */
function bestMatch(photos, tokens) {
  const need = Math.max(1, Math.ceil(tokens.length / 2))
  let best = null
  let bestScore = 0
  for (const p of photos) {
    const alt = (p.alt || "").toLowerCase()
    if (!alt) continue
    const score = tokens.filter((t) => alt.includes(stem(t))).length
    if (score >= need && score > bestScore) {
      best = p
      bestScore = score
    }
  }
  return best
}

// ---------- Pexels ----------
class RateLimitError extends Error {}
const searchCache = new Map()

async function pexelsSearch(query, perPage = 15) {
  const key = `${query}|${perPage}`
  if (searchCache.has(key)) return searchCache.get(key)

  await sleep(350) // stay well under Pexels' request rate
  const params = new URLSearchParams({ query, per_page: String(perPage), orientation: "landscape" })
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: process.env.PEXELS_API_KEY },
  })
  if (res.status === 429) throw new RateLimitError("Pexels rate limit hit")
  if (!res.ok) throw new Error(`Pexels ${res.status} for query "${query}"`)

  const data = await res.json()
  const photos = data.photos || []
  searchCache.set(key, photos)
  return photos
}

// ---------- Cloudinary ----------
const uploadCache = new Map() // pexels photo id -> cloudinary url

async function uploadToCloudinary(photo) {
  if (uploadCache.has(photo.id)) return uploadCache.get(photo.id)
  const res = await cloudinary.uploader.upload(photo.src.large, {
    public_id: `craveo/pexels-${photo.id}`, // keyed by photo id => re-runs never duplicate
    overwrite: false,
    resource_type: "image",
    transformation: [{ width: 800, crop: "limit", quality: "auto" }],
  })
  uploadCache.set(photo.id, res.secure_url)
  return res.secure_url
}

// ---------- choosing a photo ----------
async function pickForDish(item, cuisine) {
  const tokens = dishTokens(item.name)
  if (tokens.length) {
    const photos = await pexelsSearch(item.name, 15)
    const match = bestMatch(photos, tokens)
    if (match) return { photo: match, source: "match", query: item.name }
  }
  // no trustworthy match -> generic photo for the cuisine
  const query = `${cuisine || "restaurant"} food`
  const photo = pickByHash(await pexelsSearch(query, 30), item._id)
  return photo ? { photo, source: "fallback", query } : null
}

const usedForRestaurants = new Set()

async function pickForRestaurant(r) {
  const cuisine = primaryCuisine(r.cuisine)
  let query = `${cuisine ? cuisine + " " : ""}restaurant`
  let photos = await pexelsSearch(query, 30)
  if (!photos.length) {
    query = "restaurant interior"
    photos = await pexelsSearch(query, 30)
  }
  // prefer photos not already given to another restaurant so cards look varied
  const fresh = photos.filter((p) => !usedForRestaurants.has(p.id))
  const photo = pickByHash(fresh.length ? fresh : photos, r._id)
  if (!photo) return null
  usedForRestaurants.add(photo.id)
  return { photo, source: "cuisine", query }
}

// ---------- main ----------
const report = { restaurants: [], menu: [] }
const stats = { match: 0, fallback: 0, cuisine: 0, failed: 0 }

async function processDoc(kind, doc, picker, Model) {
  const label = doc.name
  try {
    const choice = await picker()
    if (!choice) {
      stats.failed++
      report[kind].push({ id: String(doc._id), name: label, status: "no photo found" })
      console.log(`  ✗ ${label} - nothing found`)
      return
    }
    const { photo, source, query } = choice
    stats[source]++

    if (DRY_RUN) {
      console.log(`  [dry] ${label} <- ${source} ("${query}") ${photo.url}`)
    } else {
      const url = await uploadToCloudinary(photo)
      await Model.updateOne({ _id: doc._id }, { $set: { image: url } })
      console.log(`  ✓ ${label} <- ${source}`)
    }
    if (source !== "match") {
      report[kind].push({ id: String(doc._id), name: label, status: source, query, pexels: photo.url })
    }
  } catch (err) {
    if (err instanceof RateLimitError) throw err // stop the whole run
    stats.failed++
    report[kind].push({ id: String(doc._id), name: label, status: "error", error: err.message })
    console.log(`  ✗ ${label} - ${err.message}`)
  }
}

async function main() {
  const required = ["MONGO_URI", "PEXELS_API_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.error(`Missing env vars in backend/.env: ${missing.join(", ")}`)
    process.exit(1)
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })

  await mongoose.connect(process.env.MONGO_URI)
  console.log(`connected${DRY_RUN ? " (DRY RUN - nothing will be uploaded or saved)" : ""}`)

  const missingImage = { $or: [{ image: { $exists: false } }, { image: null }, { image: "" }] }
  const filter = FORCE ? {} : missingImage

  try {
    if (ONLY !== "menu") {
      let q = Restaurant.find(filter).lean()
      if (LIMIT) q = q.limit(LIMIT)
      const restaurants = await q
      console.log(`\nRestaurants to process: ${restaurants.length}`)
      for (const r of restaurants) await processDoc("restaurants", r, () => pickForRestaurant(r), Restaurant)
    }

    if (ONLY !== "restaurants") {
      let q = Menu.find(filter).populate("restaurantId", "cuisine").lean()
      if (LIMIT) q = q.limit(LIMIT)
      const items = await q
      console.log(`\nMenu items to process: ${items.length}`)
      for (const item of items) {
        const cuisine = primaryCuisine(item.restaurantId && item.restaurantId.cuisine)
        await processDoc("menu", item, () => pickForDish(item, cuisine), Menu)
      }
    }
  } catch (err) {
    if (err instanceof RateLimitError) {
      console.log("\n⚠ Pexels rate limit reached. Progress so far is saved - re-run in about an hour to continue.")
    } else {
      throw err
    }
  } finally {
    const reportPath = path.resolve(__dirname, "addImages.report.json")
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log("\n--- summary ---")
    console.log(`dish-specific matches : ${stats.match}`)
    console.log(`cuisine fallbacks     : ${stats.fallback}`)
    console.log(`restaurant photos     : ${stats.cuisine}`)
    console.log(`failed                : ${stats.failed}`)
    console.log(`details of fallbacks/failures: ${reportPath}`)
    await mongoose.disconnect()
  }
}

// only auto-run when executed directly, so the helpers stay importable for tests
if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

module.exports = { dishTokens, bestMatch, primaryCuisine, pickByHash, stem }
