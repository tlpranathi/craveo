const { body } = require("express-validator")

const couponValidator = [
    body("code")
        .notEmpty().withMessage("Coupon code is required")
        .isLength({ max: 20 }).withMessage("Coupon code must be 20 characters or fewer"),
    body("discountType")
        .isIn(["percentage", "flat"]).withMessage("discountType must be 'percentage' or 'flat'"),
    body("discountValue")
        .isFloat({ min: 1 }).withMessage("discountValue must be a positive number")
        .custom((value, { req }) => {
            if (req.body.discountType === "percentage" && value > 100) {
                throw new Error("Percentage discount cannot exceed 100")
            }
            return true
        }),
    body("minOrdersRequired")
        .optional().isInt({ min: 0 }).withMessage("minOrdersRequired must be 0 or greater"),
    body("minOrderValue")
        .optional().isFloat({ min: 0 }).withMessage("minOrderValue must be 0 or greater"),
    body("maxDiscountAmount")
        .optional({ nullable: true }).isFloat({ min: 0 }).withMessage("maxDiscountAmount must be 0 or greater"),
    body("expiresAt")
        .optional({ nullable: true }).isISO8601().withMessage("expiresAt must be a valid date"),
]

module.exports = { couponValidator }
