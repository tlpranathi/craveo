const multer = require("multer")
const path = require("path")
const fs = require("fs")

// IMPORTANT: this stores files on local disk, not a cloud bucket. That's fine
// for local dev, but on Render/most hosts the filesystem is ephemeral - files
// can vanish on redeploy/restart. Fine for getting a demo working today; swap
// the storage engine for something like Cloudinary/S3 before relying on this
// long-term.

const uploadDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, unique)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

module.exports = upload