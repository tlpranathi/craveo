// server/controllers/restaurantController.js

const Restaurant = require("../models/Restaurant")
const sendResponse = require("../utils/response")

const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine } = req.query

    console.log("Query params received:", req.query) // ← debug line

    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ]
    }

    if (cuisine) {
      filter.cuisine = { $regex: `^${cuisine}$`, $options: "i" }
    }

    console.log("Filter being applied:", JSON.stringify(filter)) // ← debug line

    const restaurants = await Restaurant.find(filter)

    console.log("Results count:", restaurants.length) // ← debug line

    return sendResponse(res, 200, true, "Restaurants fetched successfully", restaurants)
  } catch (error) {
    next(error)
  }
}

module.exports = { getRestaurants }