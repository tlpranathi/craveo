const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { validate } = require("../middleware/validator")
const { couponValidator } = require("../validators/couponValidator")
const {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    getAvailableCoupons,
    validateCoupon,
} = require("../controllers/couponController")

// customer-facing
router.get("/available", protect, getAvailableCoupons)
router.post("/validate", protect, validateCoupon)

// admin-only management
router.get("/", protect, admin, getCoupons)
router.post("/", protect, admin, couponValidator, validate, createCoupon)
router.patch("/:id", protect, admin, updateCoupon)
router.delete("/:id", protect, admin, deleteCoupon)

module.exports = router
