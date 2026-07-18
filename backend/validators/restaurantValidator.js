const { body } = require("express-validator")

const restaurantValidator = [
    body("name").notEmpty().withMessage("Restaurant name is required"),
    body("cuisine").notEmpty().withMessage("Cuisine is required"),
    body("location").notEmpty().withMessage("Location is required"),
]

module.exports = { restaurantValidator }

