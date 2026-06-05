const express = require("express")
const router = express.Router()
const { getMenu } = require("../controllers/menuController")
const { validate } = require("../middleware/validator")
const { getMenuValidator } = require("../validators/menuValidator")


router.get("/:restaurantId", getMenuValidator, validator, getMenu)

module.exports = router

