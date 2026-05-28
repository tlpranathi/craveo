const Restaurant = require("../models/Restaurant")
const sendResponse = require("../utils/response")

// GET all restaurants with optional search + cuisine filters
// example: /api/restaurants?search=bangalore&cuisine=indian

const getRestaurants = async(req, res, next) => {
    try {
          const { search, cuisine } = req.query // extract query params from URL
          // search -> restaurant name or location
          // cuisine -> filters by cuisine type

          console.log("query params received:", req.query)
        
          const filter = {} // empty filter object
        
          // search filter - runs only if search query exists
          if (search) {
              // MongoDB $or operator - matches restaurants where either name matches search or location matches search
              filter.$or = [
                // regex search on restaurant name
                // $options: "i" => case-insensitive
                // "pizza" matches => Pizza Hut, PIZZA HOUSE
                
                { name: { $regex: search, $options: "i" }},
                {location: {$regex: search, $options: "i" }}
              ]
          }

          // cuisine filter - runs only if cuisine query exists 
          if (cuisine) {
              // ^ and $ enforce exact match
              filter.cuisine = { $regex: `^${cuisine}$`, $options: "i"}
          }
          console.log("filter being applied: ", JSON.stringify(filter))

          const restaurants = await Restaurant.find(filter)
          console.log("Results count: ", restaurants.length)
          return sendResponse(res, 200, true, "Restaurants fetched successfully", restaurants)
    } catch (error) {
      next(error)
    }
}

module.exports = { getRestaurants }
