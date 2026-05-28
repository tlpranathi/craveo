const jwt = require("jsonwebtoken")
const User = require("../models/User")
const AppError = require("../utils/AppError")

// protect middleware
// verifies JWT and allows access only to aunthenticated users
const protect = async (req, res, next) => {
  try {
    // extract token from authorization header
    const authHeader = req.headers.authorization

    // Bearer <token>
    if(!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Access denied. No token provided.", 401)
    }
    const token = authHeader.split(" ")[1]

    // verify token using secret
    // also decoded payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // check user still exists
    // exclude password field for security
    const user = await User.findById(decoded.id).select("-password")

    if(!user) {
      throw new AppError("User no longer exists", 401)
    }

    // attach user to request
    // allows authenticated user to request object
    // allows future controllers to access req.user
    req.user = user

    // continue request to next middleware/controller
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401))
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("token expired. please log in again", 401))
    }
    // pass remaining errors to global error handler
    next (error)
  }
}

module.exports = protect
