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

const createMenuItem = async (req, res, next) => {
    try {
         // check restaurant exists
        const { restaurantId, name } = req.body;
        const restaurant = await Restaurant.findById(restaurantId)
        if (!restaurant) {
            throw new AppError("Restaurant not found", 404)
        }
        // check for duplicate menu item in the same restaurant
        const existingItem = await Menu.findOne({restaurantId,
        name: new RegExp(`^${name.trim()}$`, "i"), // case-insensitive match
        });

        if (existingItem) { throw new AppError("A menu item with this name already exists for this restaurant", 400); }
        
        const menuItem = await Menu.create({...req.body, name: name.trim()});
        return sendResponse(res, 201, true, "Menu item created successfully", menuItem)
    } catch (error) {
        next(error)
    }
}

const updateMenuItem = async (req, res, next) => {
    try {
        const menuItem = await Menu.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true
            }
        )
        if (!menuItem) {
            throw new AppError("Menu item not found", 404)
        }

        return sendResponse(res, 200, true, "Menu item updated successfully", menuItem)
    } catch (error) {
        next(error)
    }
}

const deleteMenuItem = async (req, res, next) => {
    try {
        const menuItem = await Menu.findByIdAndDelete(req.params.id)
        if (!menuItem) {
            throw new AppError("Menu item not found", 404)
        }

        return sendResponse(res, 200, true, "Menu item deleted successfully", menuItem)
    } catch (error) {
        next(error)
    }
}

module.exports = { getMenu, createMenuItem, updateMenuItem, deleteMenuItem }

