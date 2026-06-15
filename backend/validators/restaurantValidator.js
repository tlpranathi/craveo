const { body } = require("express-validator")

const restaurantValidator = [
    body("name").notEmpty().withMessage("Restaurant name is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("cuisine").notEmpty().applywithMessage("Cuisine is required"),
]

module.exports = { restaurantValidator }

