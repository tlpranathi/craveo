const Restaurant = require("../models/Restaurant")
const sendResponse = require("../utils/response")

const getRestaurants = async(req, res, next) => {
    try {
          const { search, cuisine } = req.query
          console.log("query params received:", req.query)
        
          const filter = {}
        
          if (search) {
              filter.$or = [
                { name: { $regex: search, $options: "i" }},
                {location: {$regex: search, $options: "i" }}
              ]
          }
          if (cuisine) {
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
