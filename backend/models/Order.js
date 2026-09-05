const mongoose = require("mongoose")

// subschema/ nested schema
// snapshot of item details at purchase time
const orderItemSchema = new mongoose.Schema({
    menuItemId: {
        type: mongoose.Schema.Types.ObjectId, // linking to original menu item 
        ref: "Menu",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
})

// main order schema
const orderSchema = new mongoose.Schema ({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    items: [orderItemSchema], // stores array of ordered items
    // pre-discount sum of items - equals totalPrice when no coupon was applied.
    // kept mainly so the order receipt/history can show "was X, discounted to Y"
    subtotal: {
        type: Number
    },
    couponCode: {
        type: String
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
        default: "pending"
    },
    paidAt: {
        type: Date
    },
    payment: {
    status: {
        type: String,
        enum: ["Pending", "Successful", "Failed", "Refunded"],
        default: "Pending"
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date // set when payment is verified - cancellation window is anchored to this, not order.createdAt
}
}, {timestamps: true})

// getMyOrders: filters by user, sorts by createdAt desc
orderSchema.index({ user: 1, createdAt: -1 })

// getRestaurantOrders / owner stats: filters by restaurant, sorts by createdAt desc
orderSchema.index({ restaurant: 1, createdAt: -1 })

// getStats: match on { restaurant, status: "delivered" } for owners,
// { status: "delivered" } for the admin-wide revenue aggregation
orderSchema.index({ restaurant: 1, status: 1 })
orderSchema.index({ status: 1 })

module.exports = mongoose.model("Order", orderSchema)