const { body } = require("express-validator")

const createReviewValidator = [
  body("orderId").notEmpty().withMessage("Order ID is required.").isMongoId().withMessage("Invalid Order ID."),
  body("rating").notEmpty().withMessage("Rating is required.").isFloat({ min: 0, max: 5 }).withMessage("Rating must be between 0 and 5.").custom((value) => value % 0.5 === 0).withMessage("Rating must be in 0.5 increments."),
  body("comment").optional().trim().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters.")
]

module.exports = { createReviewValidator }