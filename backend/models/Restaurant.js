const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema({
    name: String,
    location: String,
    cuisine: String,
    rating: String,
    image: String
})

module.exports = mongoose.model("Restaurant", RestaurantSchema)
