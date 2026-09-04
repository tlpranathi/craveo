const mongoose = require("mongoose")

const ReviewSchema = new mongoose.Schema({
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
     order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true // one review per order
        },
    rating: {
        type: Number,
        required: true,
        min: [0.5, "Rating must be at least 0.5"],
        max: 5,
        validate: {
            validator: (value) => value % 0.5 === 0,
            message: "Rating must be in 0.5 increments."
        }
    },
    comment: {
        type: String,
        maxlength: [500, "Comment cannot exceed 500 characters"],
        trim: true,
        default: ""
    }
}, {timestamps: true})

// getRestaurantReviews / getAllReviews / getReviewSummary: filter by
// restaurant, sort by createdAt desc
ReviewSchema.index({ restaurant: 1, createdAt: -1 })

module.exports = mongoose.model("Review", ReviewSchema)

