const Menu = require("../models/Menu")
const Restaurant = require("../models/Restaurant")
const sendResponse = require("../utils/response")
const AppError = require("../utils/AppError")

// GET menu items for a specific restaurant
// example: /api/restaurants/:restaurantId/menu
const getMenu = async (req, res, next) => {
    try {
        const { restaurantId } = req.params 
        
        const restaurant = await Restaurant.findById(req.params.restaurantId)

        if(!restaurant) {
            throw new AppError("restaurant not found", 404)           
        }

        const items = await Menu.find({ restaurantId })
        return sendResponse(res, 200, true, "menu fetched successfully", items)

    } catch (error) {
        next(error) // goes to errorHandler
    }
 }

module.exports = { getMenu }