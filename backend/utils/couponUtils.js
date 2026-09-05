const Order = require("../models/Order")

// cartTotal is trusted only when it comes from paymentController, which
// computes it itself from menu prices server-side - the /validate endpoint
// takes it from the client purely for a pre-checkout preview, never for
// the actual charge
const evaluateCoupon = async (coupon, cartTotal, userId) => {
    if (!coupon || !coupon.isActive) {
        return { valid: false, reason: "This coupon is not active." }
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return { valid: false, reason: "This coupon has expired." }
    }
    if (cartTotal < (coupon.minOrderValue || 0)) {
        return { valid: false, reason: `Minimum order value for this coupon is ₹${coupon.minOrderValue}.` }
    }

    const deliveredOrders = await Order.countDocuments({ user: userId, status: "delivered" })
    if (deliveredOrders < (coupon.minOrdersRequired || 0)) {
        return {
            valid: false,
            reason: coupon.minOrdersRequired === 1
                ? "This coupon unlocks after your first delivered order."
                : `This coupon unlocks after ${coupon.minOrdersRequired} delivered orders (you have ${deliveredOrders}).`,
        }
    }

    let discountAmount = coupon.discountType === "percentage"
        ? (cartTotal * coupon.discountValue) / 100
        : coupon.discountValue

    if (coupon.discountType === "percentage" && coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount)
    }
    // never let a flat coupon (or a rounding edge case) take the order to
    // zero or below - Razorpay rejects a zero-amount order
    discountAmount = Math.min(discountAmount, cartTotal - 1)
    discountAmount = Math.max(0, Math.round(discountAmount * 100) / 100)

    return {
        valid: true,
        discountAmount,
        finalTotal: Math.round((cartTotal - discountAmount) * 100) / 100,
    }
}

module.exports = { evaluateCoupon }
