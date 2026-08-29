const express = require("express")
const router = express.Router()
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController")
const { validate } = require("../middleware/validator")
const { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/authValidator")
const authLimiter = require("../middleware/rateLimiter")

router.post("/signup", authLimiter, signupValidator, validate, signup)
router.post("/login", authLimiter, loginValidator, validate, login)
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword)
router.post("/reset-password/:token", authLimiter, resetPasswordValidator, validate, resetPassword)

module.exports = router