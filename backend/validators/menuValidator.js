const { param } = require("express-validator")

const getMenuValidator = [
    param("restaurantId").isMongoId().withMessage("Invalid restaurant id")
]

module.exports = {getMenuValidator}