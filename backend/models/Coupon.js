const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true, // also creates an index - findOne({code}) in validateCoupon uses it
        uppercase: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ["percentage", "flat"],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 1,
    },
    // eligibility gate: user needs at least this many delivered orders
    // before this coupon will validate for them
    minOrdersRequired: {
        type: Number,
        default: 0,
        min: 0,
    },
    // optional cap on a percentage coupon's payout, so e.g. "20% off" can't
    // blow out on a huge cart - ignored for flat coupons
    maxDiscountAmount: {
        type: Number,
        min: 0,
    },
    // optional minimum cart value required to apply this coupon at all
    minOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    expiresAt: {
        type: Date,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
}, { timestamps: true })

// getAvailableCoupons filters on isActive
couponSchema.index({ isActive: 1 })

module.exports = mongoose.model("Coupon", couponSchema)
