import { useState, useEffect } from "react"
import API from "../../services/api"
import StarRating from "../../components/StarRating"

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get("/owner/reviews")
        setReviews(res.data.data.reviews)
      } catch (err) {
        setError("Failed to load reviews.")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  if (loading) return <p className="text-gray-500 text-sm">Loading reviews...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews <span className="text-gray-400 font-normal text-sm ml-1">({reviews.length})</span>
        </h2>
        {avg && (
          <div className="flex items-center gap-2 bg-craveo-50 px-3 py-1.5 rounded-full">
            <StarRating value={Math.round(avg * 2) / 2} mode="display" size="text-sm" />
            <span className="text-craveo-700 font-semibold text-sm">{avg} avg</span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className="text-center text-gray-400 py-8">No reviews yet.</p>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-craveo-100 flex items-center justify-center text-craveo-700 text-sm font-semibold">
                  {review.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{review.user?.name}</p>
                  <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <StarRating value={review.rating} mode="display" size="text-sm" />
            </div>
            {review.comment && (
              <p className="text-sm text-gray-600 mt-2 pl-10">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}