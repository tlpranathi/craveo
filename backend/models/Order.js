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

module.exports = mongoose.model("Order", orderSchema)