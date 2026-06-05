const express = require("express")
const router = express.Router()
const { signup, login } = require("../controllers/authController")
const { validate } = require("../middleware/validator")
const { signupValidator, loginValidator } = require("../validators/authValidator")
const authLimiter = require("../middleware/rateLimiter")

router.post("/signup", authLimiter, signupValidator, validate, signup)
router.post("/login", authLimiter, loginValidator, validate, login)

module.exports = router