const express = require("express")
const router = express.Router()
const { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getRestaurantById } = require("../controllers/restaurantController")
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { validate } = require("../middleware/validator")
const { restaurantValidator } = require("../validators/restaurantValidator")


router.get("/", getRestaurants)
router.post("/", protect, admin, restaurantValidator, validate, createRestaurant)
router.put("/:id", protect, admin, restaurantValidator, validate, updateRestaurant)
router.delete("/:id", protect, admin, deleteRestaurant)
router.get("/:id", getRestaurantById)

module.exports = router


