const cloudinary = require("cloudinary").v2

// Credentials come from env so nothing secret is committed. Uploaded images
// live on Cloudinary's CDN, which (unlike Render's disk) survives redeploys.
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

module.exports = { cloudinary, isConfigured }
