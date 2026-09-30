/**
 * k6 load test: realistic public browsing on the Craveo API.
 *
 * Each virtual user repeats a "browsing session":
 *   1. lands on the restaurants page      -> GET /api/restaurants/random
 *   2. filters / searches / pages         -> GET /api/restaurants?cuisine=|search=|page=
 *   3. opens a restaurant (3 parallel)    -> GET /api/restaurants/:id, /api/menu/:id, /api/reviews/:id
 * with 1-3s of "think time" between steps, like a real person reading the screen.
 *
 * Deliberately NOT tested:
 *   - /api/reviews/:id/summary  (can call the paid AI API when the summary isn't cached)
 *   - /api/auth/*               (10 attempts / 15 min / IP rate limiter)
 *   - orders / payments         (write to the DB; Razorpay)
 *
 * Usage (from /backend):
 *   NODE_ENV=production node server.js > /dev/null     # terminal 1 (see notes below)
 *   k6 run --summary-export=load-tests/results/summary.json load-tests/browse.js   # terminal 2
 *
 * Tunables (all optional):
 *   -e BASE_URL=http://localhost:5000   -e PEAK_VUS=50   -e HOLD=2m
 *
 * Notes for trustworthy numbers:
 *   - Run the server with node, not nodemon, and send its stdout to /dev/null:
 *     getRestaurants console.logs 3 lines per request, which costs real time under load.
 *   - The DB should hold realistic volume (hundreds of restaurants, tens of menu items
 *     each). Against 10 documents, every endpoint looks fast and the numbers mean nothing.
 *   - k6 and the server share your machine's CPU here, so treat results as a floor and
 *     quote your hardware alongside them.
 */
import http from "k6/http"
import { check, group, sleep } from "k6"

const BASE_URL = __ENV.BASE_URL || "http://localhost:5000"
const PEAK_VUS = parseInt(__ENV.PEAK_VUS || "50", 10)
const HOLD = __ENV.HOLD || "2m"

export const options = {
  scenarios: {
    browsing: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: PEAK_VUS }, // ramp up
        { duration: HOLD, target: PEAK_VUS }, // steady state: this is what the headline numbers describe
        { duration: "20s", target: 0 }, // ramp down
      ],
      gracefulRampDown: "10s",
    },
  },
  thresholds: {
    // overall health
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    // per endpoint, so a slow one can't hide inside the blended average.
    // search gets a looser bar: it uses unanchored regex, which can't use an index.
    "http_req_duration{endpoint:random}": ["p(95)<500"],
    "http_req_duration{endpoint:list}": ["p(95)<500"],
    "http_req_duration{endpoint:filter}": ["p(95)<500"],
    "http_req_duration{endpoint:search}": ["p(95)<800"],
    "http_req_duration{endpoint:detail}": ["p(95)<500"],
    "http_req_duration{endpoint:menu}": ["p(95)<500"],
    "http_req_duration{endpoint:reviews}": ["p(95)<500"],
  },
}

const ok = (res) => res.status === 200

function body(res) {
  try {
    return res.json()
  } catch (e) {
    return null
  }
}

// Runs once before the test: learn real restaurant ids / cuisines / search terms from
// the API itself so the test works on whatever data is in the DB.
export function setup() {
  const res = http.get(`${BASE_URL}/api/restaurants?page=1&limit=100`)
  const data = ok(res) && body(res) && body(res).data
  if (!data || !Array.isArray(data.restaurants) || data.restaurants.length === 0) {
    throw new Error(`Setup failed: could not load restaurants from ${BASE_URL} (status ${res.status}). Is the server running and the DB seeded?`)
  }

  const restaurants = data.restaurants
  const ids = restaurants.map((r) => r._id)
  // only plain-word cuisines: the API builds a regex from this value
  const cuisines = [...new Set(restaurants.map((r) => r.cuisine).filter((c) => c && /^[A-Za-z ]+$/.test(c)))]
  const terms = [
    ...new Set(
      restaurants
        .flatMap((r) => [r.name, r.location])
        .filter(Boolean)
        .map((s) => s.split(/[\s,]+/)[0])
        .filter((w) => w && w.length > 2 && /^[A-Za-z]+$/.test(w))
    ),
  ]

  console.log(`setup: ${data.totalRestaurants} restaurants in DB, sampling ${ids.length}, ${cuisines.length} cuisines, ${terms.length} search terms`)
  if (data.totalRestaurants < 50) {
    console.warn("WARNING: fewer than 50 restaurants in the DB. Results will look unrealistically fast; seed more data before quoting numbers.")
  }
  return { ids, cuisines, terms }
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const think = () => sleep(1 + Math.random() * 2) // 1-3s

// tag every request with a stable endpoint label (and a fixed `name` so ids in the URL
// don't create thousands of separate metric series)
const tag = (endpoint, name) => ({ tags: { endpoint, name } })

export default function (data) {
  // 1. land on the restaurants page
  group("land", () => {
    const res = http.get(`${BASE_URL}/api/restaurants/random?limit=8`, tag("random", "GET /api/restaurants/random"))
    check(res, {
      "random: 200": ok,
      "random: has restaurants": (r) => {
        const b = body(r)
        return !!b && b.success === true && Array.isArray(b.data.restaurants)
      },
    })
  })
  think()

  // 2. narrow things down: 45% filter by cuisine, 35% search, 20% just page through
  group("discover", () => {
    const roll = Math.random()
    let res
    if (roll < 0.45 && data.cuisines.length) {
      const cuisine = encodeURIComponent(pick(data.cuisines))
      res = http.get(`${BASE_URL}/api/restaurants?cuisine=${cuisine}&page=1&limit=12`, tag("filter", "GET /api/restaurants?cuisine"))
      check(res, { "filter: 200": ok })
    } else if (roll < 0.8 && data.terms.length) {
      const term = encodeURIComponent(pick(data.terms))
      res = http.get(`${BASE_URL}/api/restaurants?search=${term}&page=1&limit=12`, tag("search", "GET /api/restaurants?search"))
      check(res, { "search: 200": ok })
    } else {
      const page = 1 + Math.floor(Math.random() * 3)
      res = http.get(`${BASE_URL}/api/restaurants?page=${page}&limit=12`, tag("list", "GET /api/restaurants?page"))
      check(res, {
        "list: 200": ok,
        "list: has pagination": (r) => {
          const b = body(r)
          return !!b && b.data && Array.isArray(b.data.restaurants) && typeof b.data.totalPages === "number"
        },
      })
    }
  })
  think()

  // 3. open a restaurant: the page fires these three requests together
  group("open restaurant", () => {
    const id = pick(data.ids)
    const [detail, menu, reviews] = http.batch([
      ["GET", `${BASE_URL}/api/restaurants/${id}`, null, tag("detail", "GET /api/restaurants/:id")],
      ["GET", `${BASE_URL}/api/menu/${id}`, null, tag("menu", "GET /api/menu/:id")],
      ["GET", `${BASE_URL}/api/reviews/${id}?page=1&limit=10`, null, tag("reviews", "GET /api/reviews/:id")],
    ])
    check(detail, {
      "detail: 200": ok,
      "detail: has restaurant": (r) => {
        const b = body(r)
        return !!b && b.success === true && !!b.data && !!b.data._id
      },
    })
    check(menu, {
      "menu: 200": ok,
      "menu: is array": (r) => {
        const b = body(r)
        return !!b && Array.isArray(b.data)
      },
    })
    check(reviews, {
      "reviews: 200": ok,
      "reviews: has list": (r) => {
        const b = body(r)
        return !!b && !!b.data && Array.isArray(b.data.reviews)
      },
    })
  })
  think()
}
