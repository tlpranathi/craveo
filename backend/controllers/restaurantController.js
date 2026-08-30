const Restaurant = require("../models/Restaurant")
const sendResponse = require("../utils/response")
const AppError = require("../utils/AppError")
const { escapeRegex, resolveLocationAliases } = require("../utils/searchHelpers")

// GET all restaurants with optional search + cuisine filters
// example: /api/restaurants?search=bangalore&cuisine=indian

const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("owner", "name email")
    if (!restaurant) throw new AppError("Restaurant not found", 404)
    return sendResponse(res, 200, true, "Restaurant fetched", restaurant)
  } catch (error) {
    next(error)
  }
}

// GET /api/restaurants/random?limit=8
// returns a random sample of restaurants - used on the Restaurants page's
// initial load so browsing feels fresh instead of always showing the same
// restaurants in the same (insertion) order
const getRandomRestaurants = async (req, res, next) => {
  try {
    // clamp so this can't be abused to pull the entire collection at once
    const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 20)

    const restaurants = await Restaurant.aggregate([{ $sample: { size: limit } }])

    return sendResponse(res, 200, true, "Random restaurants fetched successfully", { restaurants })
  } catch (error) {
    next(error)
  }
}

const getRestaurants = async(req, res, next) => {
    try {
          const { search, cuisine, page = 1, limit = 10, sort } = req.query // extract query params from URL
          // search -> restaurant name or location
          // cuisine -> filters by cuisine type
          const pageNumber = Math.max(1, Number(page))
          const limitNumber = Math.max(1, Number(limit))
          const skip = (pageNumber-1)*limitNumber
          console.log("query params received:", req.query)
        
          const filter = {} // empty filter object

          // search filter - runs only if search query exists
          if (search) {
              // MongoDB $or operator - matches restaurants where either name matches search or location matches search
              const trimmedSearch = search.trim()
              const safeSearch = escapeRegex(trimmedSearch)
              const orConditions = [
                { name: { $regex: safeSearch, $options: "i" }},
                { location: { $regex: safeSearch, $options: "i" }},
                { cuisine: { $regex: safeSearch, $options: "i" }},
              ]
              const aliasMatches = resolveLocationAliases(trimmedSearch)
              aliasMatches.forEach((canonicalLocation) => {
                orConditions.push({ location: { $regex: escapeRegex(canonicalLocation), $options: "i" } })
              })
              filter.$or = orConditions
          }

          // cuisine filter - runs only if cuisine query exists 
          if (cuisine) {
              // ^ and $ enforce exact match
              filter.cuisine = { $regex: `^${cuisine}$`, $options: "i"}
          }
          console.log("filter being applied: ", JSON.stringify(filter))
          const totalRestaurants = await Restaurant.countDocuments(filter)
          const totalPages = Math.ceil(totalRestaurants/limitNumber)

          // only allow sorting on fields that make sense, so this can't be abused to sort on arbitrary fields via query string
          const allowedSorts = { averageRating: "averageRating", "-averageRating": "-averageRating" }
          const sortOption = allowedSorts[sort] || undefined

          // populate owner so the admin list can show who owns each restaurant
          // instead of just a raw ObjectId
          let query = Restaurant.find(filter).populate("owner", "name email").skip(skip).limit(limitNumber)
          if (sortOption) query = query.sort(sortOption)
          const restaurants = await query
          console.log("Results count: ", restaurants.length)
          return sendResponse(res, 200, true, "Restaurants fetched successfully", { restaurants, page:pageNumber, limit: limitNumber, totalRestaurants, totalPages})
    } catch (error) {
      next(error)
    }
}

const createRestaurant = async(req, res, next) => {
  try {
    const restaurant  = await Restaurant.create(req.body)
    return sendResponse(res, 201, true, "Restaurant created successfully", restaurant)
  } catch (error) {
    next(error)
  }
}

const updateRestaurant = async(req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { // restaurant id from url and fields to update
      new: true, // return updated document instead of old one
      runValidators: true // apply schema validations during update
    })
    if (!restaurant) {
    throw new AppError("Restaurant not found", 404)
    }
   return sendResponse(res, 200, true, "Restaurant updated successfully", restaurant)
  } catch (error) {
  next(error)
  }
}

const deleteRestaurant = async(req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id)
    if (!restaurant) throw new AppError("Restaurant not found", 404)
    return sendResponse(res, 200, true, "Restaurant deleted successfully", restaurant)
  } catch (error) {
  next(error) 
  }
}

module.exports = { getRestaurants, getRandomRestaurants, createRestaurant, updateRestaurant, deleteRestaurant, getRestaurantById, uploadImage }

// admin uploads an image file and gets back a URL to store on a restaurant/menu item
function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, "No image file provided")
    }
    // BACKEND_URL should be set in env for production so the returned URL is absolute and actually loads from the deployed backend, not localhost
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`
    const url = `${baseUrl}/uploads/${req.file.filename}`
    return sendResponse(res, 200, true, "Image uploaded successfully", { url })
  } catch (error) {
    next(error)
  }
}