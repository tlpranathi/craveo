const Coupon = require("../models/Coupon")
const Order = require("../models/Order")
const sendResponse = require("../utils/response")
const { evaluateCoupon } = require("../utils/couponUtils")

// ---------- admin ----------

const createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create({ ...req.body, createdBy: req.user._id })
        return sendResponse(res, 201, true, "Coupon created", { coupon })
    } catch (err) {
        if (err.code === 11000) return sendResponse(res, 400, false, "A coupon with this code already exists.")
        next(err)
    }
}

const getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 })
        return sendResponse(res, 200, true, "Coupons fetched", { coupons })
    } catch (err) {
        next(err)
    }
}

const updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id)
        if (!coupon) return sendResponse(res, 404, false, "Coupon not found")

        Object.assign(coupon, req.body)
        await coupon.save() // runs full schema validation (enum/min/etc.)

        return sendResponse(res, 200, true, "Coupon updated", { coupon })
    } catch (err) {
        if (err.code === 11000) return sendResponse(res, 400, false, "A coupon with this code already exists.")
        next(err)
    }
}

const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id)
        if (!coupon) return sendResponse(res, 404, false, "Coupon not found")
        return sendResponse(res, 200, true, "Coupon deleted")
    } catch (err) {
        next(err)
    }
}

// ---------- customer ----------

// coupons the logged-in user is currently eligible for, so the cart can
// offer a picker instead of making them know/type a code blind
const getAvailableCoupons = async (req, res, next) => {
    try {
        const deliveredOrders = await Order.countDocuments({ user: req.user._id, status: "delivered" })
        const coupons = await Coupon.find({
            isActive: true,
            minOrdersRequired: { $lte: deliveredOrders },
            $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }],
        }).sort({ discountValue: -1 })
        return sendResponse(res, 200, true, "Available coupons fetched", { coupons })
    } catch (err) {
        next(err)
    }
}

// pre-checkout preview only — paymentController.createOrder independently
// re-validates and computes the real discount server-side before charging,
// this endpoint never sets anything on an order
const validateCoupon = async (req, res, next) => {
    try {
        const { code, cartTotal } = req.body
        if (!code || cartTotal === undefined) {
            return sendResponse(res, 400, false, "Coupon code and cart total are required.")
        }

        const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() })
        if (!coupon) return sendResponse(res, 404, false, "Invalid coupon code.")

        const result = await evaluateCoupon(coupon, Number(cartTotal), req.user._id)
        if (!result.valid) return sendResponse(res, 400, false, result.reason)

        return sendResponse(res, 200, true, "Coupon applied", {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: result.discountAmount,
            finalTotal: result.finalTotal,
        })
    } catch (err) {
        next(err)
    }
}

module.exports = { createCoupon, getCoupons, updateCoupon, deleteCoupon, getAvailableCoupons, validateCoupon }
