const express = require("express")
const router = express.Router()
const { getRestaurants } = require("../controllers/restaurantController")


router.get("/", getRestaurants)

module.exports = router


