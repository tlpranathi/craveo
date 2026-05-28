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
    rating: {
      type: Number,
      min: 0,
      max: 5      
    },
    image: String, 
}, {timestamps: true}) // automatically adds 2 fields - createdAt and updatedAt

module.exports = mongoose.model("Restaurant", RestaurantSchema)
