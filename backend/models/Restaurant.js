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

module.exports = mongoose.model("Restaurant", RestaurantSchema)
