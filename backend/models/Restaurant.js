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
    }

}, {timestamps: true}) // automatically adds 2 fields - createdAt and updatedAt

module.exports = mongoose.model("Restaurant", RestaurantSchema)
