const multer = require("multer")

// Files are held in memory just long enough to stream them to Cloudinary (see
// uploadImage in restaurantController). Nothing is written to local disk, so
// this works on hosts with an ephemeral filesystem like Render.

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false)
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

module.exports = upload