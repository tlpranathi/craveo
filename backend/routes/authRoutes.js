const express = require("express")
const router = express.Router()
const { signup, login } = require("../controllers/authController")
const { validate } = require("../middleware/validator")
const { signupValidator, loginValidator } = require("../validators/authValidator")

router.post("/signup", signupValidator, validate, signup)
router.post("/login", loginValidator, validate, login)

module.exports = router