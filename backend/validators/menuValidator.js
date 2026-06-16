const { body, param } = require("express-validator")

const getMenuValidator = [
    param("restaurantId").isMongoId().withMessage("Invalid restaurant id"),
]   

const createMenuValidator = [
    body("restaurantId").notEmpty().withMessage("Restaurant ID is required").isMongoId().withMessage("Invalid restaurant ID"),
    body("name").notEmpty().withMessage("Menu Item name is required"),
    body("price").notEmpty().withMessage("Price is required").isFloat({min:0}).withMessage("Price must be greater than 0"),
]

const updateMenuValidator = [
    body("restaurantId").optional().isMongoId().withMessage("Invalid restaurant ID"),
    body("name").optional().notEmpty().withMessage("Menu Item name is required"),
    body("price").optional().isFloat({min:0}).withMessage("Price must be greater than 0"),

]

module.exports = {getMenuValidator, createMenuValidator, updateMenuValidator}