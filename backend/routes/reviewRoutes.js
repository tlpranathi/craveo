const express = require("express")
const router = express.Router()
const { createReview, getRestaurantReviews } = require("../controllers/reviewController")
const { protect } = require("../middleware/authMiddleware")
const { validate } = require("../middleware/validator")
const { createReviewValidator } = require("../validators/reviewValidator")


router.post("/reviews", protect, createReviewValidator, validate, createReview)
router.get("/reviews/:restaurantId", getRestaurantReviews)

module.exports = router
