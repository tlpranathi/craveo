const express = require("express")
const router = express.Router()
const { createReview, getRestaurantReviews, getReviewSummary } = require("../controllers/reviewController")
const protect  = require("../middleware/protect")
const { validate } = require("../middleware/validator")
const { createReviewValidator } = require("../validators/createReviewValidator")


router.post("/", protect, createReviewValidator, validate, createReview)
router.get("/:restaurantId/summary", getReviewSummary)
router.get("/:restaurantId", getRestaurantReviews)

module.exports = router
