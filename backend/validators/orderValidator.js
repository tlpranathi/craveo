const { body } = require("express-validator")

const placeOrderValidator = [
    body("restaurantId").notEmpty().withMessage("Restaurant ID is required").isMongoId().withMessage("Invalid restaurant ID"),
    body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
]

const updateOrderStatusValidator = [
    body("status").notEmpty().withMessage("Status is required").isIn(["pending","confirmed","preparing","delivered","cancelled",]).withMessage("Invalid status value"),
]

module.exports = { placeOrderValidator, updateOrderStatusValidator }