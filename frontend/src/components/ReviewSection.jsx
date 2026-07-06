import { useState, useEffect, useRef } from "react"
import { useAuth } from "../context/AuthContext"
import API from "../services/api"
import StarRating from "./StarRating"

export default function ReviewSection({ restaurantId, autoOpen = false }) {
  const { user } = useAuth()
  const formRef = useRef(null)

  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  const [eligibleOrder, setEligibleOrder] = useState(null)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(true)

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")
  const [highlighted, setHighlighted] = useState(false)

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await API.get(`/reviews/${restaurantId}`)
      const { reviews, totalReviews } = res.data.data
      setReviews(reviews)
      setTotalReviews(totalReviews)
    } catch (err) {
      // fail silently
    } finally {
      setLoadingReviews(false)
    }
  }

  const checkEligibility = async () => {
    if (!user) { setCheckingEligibility(false); return }
    try {
      const res = await API.get("/orders/my-orders")
      const orders = res.data.data.orders

      // find ALL delivered orders for this restaurant
      const deliveredOrders = orders.filter(
        (o) => o.restaurant?._id === restaurantId && o.status === "delivered"
      )

      if (deliveredOrders.length === 0) {
        setEligibleOrder(null)
        setCheckingEligibility(false)
        return
      }

      // check which ones have already been reviewed
      const reviewRes = await API.get(`/reviews/${restaurantId}`)
      const existingReviews = reviewRes.data.data.reviews

      // find a delivered order that hasn't been reviewed yet
      const unreviewed = deliveredOrders.find(
        (o) => !existingReviews.some((r) => r.order === o._id || r.order?._id === o._id)
      )

      setEligibleOrder(unreviewed || null)
      setAlreadyReviewed(!unreviewed && deliveredOrders.length > 0)
    } catch (err) {
      // fail silently
    } finally {
      setCheckingEligibility(false)
    }
  }

  // auto-scroll + highlight if redirected from Orders page
  useEffect(() => {
    fetchReviews()
    checkEligibility()
  }, [restaurantId])

  useEffect(() => {
    if (autoOpen && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
        setHighlighted(true)
        setTimeout(() => setHighlighted(false), 2000) // remove highlight after 2s
      }, 500) // small delay so page finishes rendering first
    }
  }, [autoOpen, checkingEligibility])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setFormSuccess("")

    if (rating === 0) { setFormError("Please select a star rating."); return }
    if (comment.length > 500) { setFormError("Comment cannot exceed 500 characters."); return }

    setSubmitting(true)
    try {
      await API.post("/reviews", {
        orderId: eligibleOrder._id,
        rating,
        comment,
      })
      setFormSuccess("Review submitted!")
      setAlreadyReviewed(true)
      setEligibleOrder(null)
      setRating(0)
      setComment("")
      fetchReviews()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">

      {/* write a review */}
      {user && !checkingEligibility && (
        <div className="mb-8">
          {!eligibleOrder && !alreadyReviewed && (
            <p className="text-sm text-gray-400 italic mb-6">
              Order and get it delivered to leave a review.
            </p>
          )}

          {alreadyReviewed && !eligibleOrder && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
              You've reviewed all your delivered orders for this restaurant.
            </div>
          )}

          {eligibleOrder && (
            <div ref={formRef} className={`bg-white border rounded-xl p-5 mb-6 transition-all duration-500 ${ highlighted ? "border-craveo-400 ring-2 ring-craveo-300 shadow-md" : "border-gray-200" }`}>
              <h3 className="font-semibold text-gray-900 mb-4">Write a review</h3>
              {formError && (
                <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="border-l-4 border-green-400 bg-green-50 text-green-700 text-sm px-4 py-2.5 mb-4">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Rating
                  </label>
                  <StarRating value={rating} onChange={setRating} mode="input" size="text-3xl"/>
                  {rating > 0 && (
                    <p className="text-sm text-craveo-600 mt-1 font-medium">{rating} / 5</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    Comment
                    <span className="normal-case text-gray-400 ml-1">(optional)</span>
                  </label>
                  <textarea rows={3} placeholder="What did you think of the food?" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 resize-none"/>
                  {/* character counter */}
                  <p className={`text-xs mt-1 text-right ${comment.length > 450 ? "text-red-500" : "text-gray-400"}`}> {comment.length}/500
                  </p>
                </div>

                <button type="submit" disabled={submitting} className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50">
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* reviews list */}
      <h3 className="font-semibold text-gray-900 mb-4">
        {totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}` : "No reviews yet"}
      </h3>

      {loadingReviews && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {!loadingReviews && reviews.length === 0 && (
        <p className="text-gray-400 text-sm">
          No reviews yet — be the first after your order is delivered.
        </p>
      )}

      {!loadingReviews && reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-craveo-100 flex items-center justify-center text-craveo-700 text-sm font-semibold">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    {review.user?.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              <StarRating value={review.rating} mode="display" size="text-base" />

              {review.comment && (
                <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}