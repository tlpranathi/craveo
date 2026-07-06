const Review = require("../models/Review")
const Order = require("../models/Order")
const Restaurant = require("../models/Restaurant")
const AppError = require("../utils/AppError")
const sendResponse = require("../utils/response")

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body
    // find the order
    const order = await Order.findById(orderId)
    if (!order) { throw new AppError("Order not found.", 404) }
    // check ownership
    if (order.user.toString() !== req.user._id.toString()) { throw new AppError("Not authorized to review this order.", 403) }
    // check delivery status
    if (order.status.toLowerCase() !== "delivered") { throw new AppError("You can only review delivered orders.", 400) }
    // check if already reviewed for each order
    const existingReview = await Review.findOne({ order: orderId, user: req.user._id })
    if (existingReview) throw new AppError("You have already reviewed this order.", 400)
    // create review
    const review = await Review.create({
      user: req.user._id,
      restaurant: order.restaurant,
      order: order._id,
      rating,
      comment
    })
    // recalculate restaurant rating
    const reviews = await Review.find({ restaurant: order.restaurant })
    const numberOfReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) /numberOfReviews
    await Restaurant.findByIdAndUpdate(order.restaurant, { rating: Number(averageRating.toFixed(1)), numberOfReviews })
    return sendResponse(res, 201, true, "Review added successfully.", { review })
  } catch (error) {
    next(error)
  }
}

// GET /api/reviews/:restaurantId
const getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params // restaurant id from url
    // pagination values - page=1, limit=10 - defaults
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 10, 1)
    const skip = (page - 1) * limit // number of documents to skip
    const totalReviews = await Review.countDocuments({ restaurant: restaurantId })
    const totalPages = Math.ceil(totalReviews / limit)

    const reviews = await Review.find({
      restaurant: restaurantId
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return sendResponse(res, 200, true, "Reviews fetched successfully.", { reviews, page, limit, totalReviews, totalPages
      }
    )
  } catch (error) {
    next(error)
  }
}
module.exports = { createReview, getRestaurantReviews }