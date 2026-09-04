const Review = require("../models/Review")
const Order = require("../models/Order")
const Restaurant = require("../models/Restaurant")
const AppError = require("../utils/AppError")
const sendResponse = require("../utils/response")
const updateRestaurantRating = require("../utils/updateRestaurantRating");
const { generateAiReviewSummary } = require("../utils/aiReviewSummary")

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
    const { averageRating, numberOfReviews } = await updateRestaurantRating(review.restaurant);

    // populate the reviewer's name for the live feed on owner/admin/public
    // pages - avoids each listener re-fetching just to show who wrote it
    await review.populate("user", "name")

    const io = req.app.get("io")
    if (io) {
      const payload = { review, restaurantId: review.restaurant, averageRating, numberOfReviews }
      io.to(`restaurant_${review.restaurant}`).emit("reviewCreated", payload)
      io.to("adminRoom").emit("reviewCreated", payload)
      io.to(`restaurantPublic_${review.restaurant}`).emit("reviewCreated", payload)
    }

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

const getAllReviews = async (req, res, next) => {
    try {
        let query = {};
        if (req.user.role === "owner") { const restaurant = await Restaurant.findOne({ owner: req.user._id });
            if (!restaurant) { throw new AppError("Restaurant not found",404); }
            query.restaurant = restaurant._id;
        }
        const { page = 1, limit = 10 } = req.query
        const pageNumber = Math.max(1, Number(page))
        const limitNumber = Math.max(1, Number(limit))
        const skip = (pageNumber - 1) * limitNumber
        const totalReviews = await Review.countDocuments(query)
        const totalPages = Math.max(0, Math.ceil(totalReviews / limitNumber))

        const reviews = await Review.find(query)
            .populate("user","name")
            .populate("restaurant","name")
            .sort({ createdAt:-1 })
            .skip(skip)
            .limit(limitNumber);
        
         // stats need to cover ALL matching reviews, not just this page - otherwise the average/breakdown would shift depending on which page you're on
        const statsAgg = await Review.aggregate([
          { $match: query },
          {
            $group: {
              _id: null,
              avgRating: { $avg: "$rating" },
              count: { $sum: 1 },
              // half-star buckets round down to the nearest whole star for the breakdown
              star5: { $sum: { $cond: [{ $gte: ["$rating", 4.5] }, 1, 0] } },
              star4: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 3.5] }, { $lt: ["$rating", 4.5] }] }, 1, 0] } },
              star3: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 2.5] }, { $lt: ["$rating", 3.5] }] }, 1, 0] } },
              star2: { $sum: { $cond: [{ $and: [{ $gte: ["$rating", 1.5] }, { $lt: ["$rating", 2.5] }] }, 1, 0] } },
              star1: { $sum: { $cond: [{ $lt: ["$rating", 1.5] }, 1, 0] } },
            }
          }
        ])

        const stats = statsAgg[0]
          ? {
             avgRating: Math.round(statsAgg[0].avgRating * 10) / 10,
              count: statsAgg[0].count,
              breakdown: {
                5: statsAgg[0].star5,
                4: statsAgg[0].star4,
                3: statsAgg[0].star3,
                2: statsAgg[0].star2,
                1: statsAgg[0].star1,
              }
            }
          : { avgRating: 0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }

        return sendResponse(res,200,true,"Reviews fetched",{ reviews, stats, page: pageNumber, limit: limitNumber, totalReviews, totalPages });   
      } catch(err){
        next(err);
    }
}

// GET /api/reviews/:restaurantId/summary
// returns a short AI-written summary of a restaurant's reviews, caching it
// on the restaurant doc so repeat page loads don't re-hit the AI API
const getReviewSummary = async (req, res, next) => {
  try {
    const { restaurantId } = req.params

    const restaurant = await Restaurant.findById(restaurantId)
    if (!restaurant) throw new AppError("Restaurant not found", 404)

    if (restaurant.numberOfReviews === 0) {
      return sendResponse(res, 200, true, "Not enough reviews to summarize yet", {
        summary: null,
        source: "none",
      })
    }

    // reuse the cached summary if no new reviews have come in since it was
    // generated - avoids hitting the AI API on every page load
    if (restaurant.aiSummary && restaurant.aiSummaryReviewCount === restaurant.numberOfReviews) {
      return sendResponse(res, 200, true, "Review summary fetched", {
        summary: restaurant.aiSummary,
        source: "ai-cached",
      })
    }

    // pull the most recent reviews with actual comments to summarize
    const recentReviews = await Review.find({ restaurant: restaurantId, comment: { $ne: "" } })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("rating comment")

    try {
      const summary = await generateAiReviewSummary(restaurant.name, recentReviews)
      restaurant.aiSummary = summary
      restaurant.aiSummaryReviewCount = restaurant.numberOfReviews
      await restaurant.save()

      return sendResponse(res, 200, true, "Review summary generated", {
        summary,
        source: "ai",
      })
    } catch (aiError) {
      // AI generation is a nice-to-have, not critical - fall back to a plain
      // stats-based line instead of failing the whole request when the API
      // key is missing or the request errors out
      console.error("AI review summary failed, falling back:", aiError.message)
      const fallbackSummary = `Rated ${restaurant.averageRating}/5 based on ${restaurant.numberOfReviews} review${restaurant.numberOfReviews !== 1 ? "s" : ""}.`
      return sendResponse(res, 200, true, "Review summary fetched", {
        summary: fallbackSummary,
        source: "fallback",
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = { createReview, getRestaurantReviews, getAllReviews, getReviewSummary }