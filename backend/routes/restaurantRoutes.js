const express = require("express")
const router = express.Router()
const { getRestaurants, getRandomRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getRestaurantById, uploadImage } = require("../controllers/restaurantController")
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const upload = require("../middleware/upload")
const { validate } = require("../middleware/validator")
const { restaurantValidator } = require("../validators/restaurantValidator")


router.get("/", getRestaurants)
router.get("/random", getRandomRestaurants)
router.post("/", protect, admin, restaurantValidator, validate, createRestaurant)
router.put("/:id", protect, admin, restaurantValidator, validate, updateRestaurant)
router.delete("/:id", protect, admin, deleteRestaurant)
router.post("/upload", protect, admin, upload.single("image"), uploadImage)
router.get("/:id", getRestaurantById)

module.exports = router


