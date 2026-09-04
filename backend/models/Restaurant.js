const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true // automatically removes extra spaces to help maintain clean database data
    }, 
    location: {
      type: String, 
      trim: true
    }, 
    cuisine: {
      type: String, 
      trim: true
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0      
    },
    image: String, 
    numberOfReviews : {
      type: Number,
      default: 0,
      min: 0
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      default: null
    },
    // cached AI-generated summary of this restaurant's reviews, plus the
    // review count it was generated for - regenerated only when new reviews
    // have come in since, so we don't hit the AI API on every page load
    aiSummary: {
      type: String,
      default: ""
    },
    aiSummaryReviewCount: {
      type: Number,
      default: 0
    }

}, {timestamps: true}) // automatically adds 2 fields - createdAt and updatedAt

// Restaurant.findOne({ owner }) runs on nearly every owner-dashboard request
// (orders, menu, reviews, stats all resolve the restaurant from the owner first)
RestaurantSchema.index({ owner: 1 })

// cuisine filter uses an anchored ^...$ regex, which an index can serve
RestaurantSchema.index({ cuisine: 1 })

// NOTE: the `search` param (name/location/cuisine) uses an unanchored,
// case-insensitive regex for substring matching. A plain index can't speed
// up an unanchored regex - Mongo still has to scan every candidate. A real
// fix means either a $text index (word-based, not substring) or Atlas
// Search, both of which change matching behavior, so left out of this pass -
// flag if you want to tackle that separately.

module.exports = mongoose.model("Restaurant", RestaurantSchema)
