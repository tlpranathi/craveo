import { useState, useEffect } from "react"
import API from "../services/api"
import socket from "../services/socketService"
import StarRating from "./StarRating"
import { Sparkles } from "lucide-react"

// Displays a restaurant's AI-generated review summary plus its full list of
// reviews. Writing a review now happens inline on the Orders page
// (see OrderReviewForm) instead of here.
export default function ReviewSection({ restaurantId }) {
  const [reviews, setReviews] = useState([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(true)

  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

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

  const fetchSummary = async () => {
    setSummaryLoading(true)
    try {
      const res = await API.get(`/reviews/${restaurantId}/summary`)
      setSummary(res.data.data.summary)
    } catch (err) {
      // fail silently - the summary is a nice-to-have, not core functionality
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchSummary()
  }, [restaurantId])

  // live updates: prepend a newly-submitted review without a refetch -
  // the room itself is joined by the parent Menu page
  useEffect(() => {
    const handleReviewCreated = (payload) => {
      if (payload.restaurantId !== restaurantId) return
      setReviews((prev) => [payload.review, ...prev])
      setTotalReviews((prev) => prev + 1)
    }
    socket.on("reviewCreated", handleReviewCreated)
    return () => socket.off("reviewCreated", handleReviewCreated)
  }, [restaurantId])

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">

      {/* AI-generated review summary */}
      {!summaryLoading && summary && (
        <div className="bg-craveo-50 border border-craveo-100 rounded-xl p-4 mb-6 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-craveo-500 flex-shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-craveo-700 uppercase tracking-wide mb-1">
              What people are saying
            </p>
            <p className="text-sm text-gray-700">{summary}</p>
          </div>
        </div>
      )}

      {/* Reviews list — public */}
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
