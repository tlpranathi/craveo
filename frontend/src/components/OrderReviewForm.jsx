import { useState } from "react"
import API from "../services/api"
import StarRating from "./StarRating"

// Inline review form for a single order - rendered directly on the Orders
// page (expanded under the order card) instead of redirecting to the
// restaurant's menu page to write a review.
export default function OrderReviewForm({ order, onSubmitted, onCancel }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    if (rating === 0) { setFormError("Please select a star rating."); return }
    if (comment.length > 500) { setFormError("Comment cannot exceed 500 characters."); return }

    setSubmitting(true)
    try {
      await API.post("/reviews", { orderId: order._id, rating, comment })
      onSubmitted()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-craveo-50/50 border border-craveo-200 rounded-xl p-4 mt-3">
      <h4 className="font-semibold text-gray-900 mb-3 text-sm">
        Rate your order from {order.restaurant?.name || "this restaurant"}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5">
            {formError}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Rating
          </label>
          <StarRating value={rating} onChange={setRating} mode="input" size="text-3xl" />
          {rating > 0 && (
            <p className="text-sm text-craveo-600 mt-1 font-medium">{rating} / 5</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Comment
            <span className="normal-case text-gray-400 ml-1">(optional)</span>
          </label>
          <textarea
            rows={3}
            placeholder="What did you think of the food?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 resize-none bg-white"
          />
          <p className={`text-xs mt-1 text-right ${comment.length > 450 ? "text-red-500" : "text-gray-400"}`}>
            {comment.length}/500
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>
    </div>
  )
}
