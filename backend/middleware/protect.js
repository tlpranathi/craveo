// server/middleware/protect.js

const jwt = require("jsonwebtoken")
const User = require("../models/User")
const AppError = require("../utils/AppError")

const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401)
    }

    const token = authHeader.split(" ")[1]

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Check user still exists
    const user = await User.findById(decoded.id).select("-password")

    if (!user) {
      throw new AppError("User no longer exists.", 401)
    }

    // 4. Attach user to request
    req.user = user

    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401))
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401))
    }
    next(error)
  }
}

module.exports = protect