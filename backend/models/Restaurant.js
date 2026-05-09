// server/models/Restaurant.js

const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  cuisine: {
    type: String,
    trim: true,
  },
  rating: {
    type: Number,  // ← was String, now Number
    min: 0,
    max: 5,
  },
  image: {
    type: String,
  },
}, { timestamps: true })

module.exports = mongoose.model("Restaurant", RestaurantSchema)