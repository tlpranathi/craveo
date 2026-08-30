import { useState, useEffect } from "react"
import API from "../../services/api"
import StarRating from "../../components/StarRating"
import Pagination from "../../components/Pagination"

const PAGE_SIZE = 10

export default function OwnerReviews() {
  const [reviews, setReviews] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  // matches the shape returned by GET /api/owner/reviews: { avgRating, count, breakdown: {1..5} }
  const [stats, setStats] = useState({ avgRating: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const res = await API.get("/owner/reviews", { params: { page, limit: PAGE_SIZE } })
        const { reviews, totalReviews, totalPages, stats } = res.data.data
        setReviews(reviews)
        setTotalReviews(totalReviews)
        setTotalPages(totalPages)
        if (stats) setStats(stats)
      } catch (err) {
        setError("Failed to load reviews.")
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [page])

  if (loading) return <p className="text-gray-500 text-sm">Loading reviews...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Reviews <span className="text-gray-400 font-normal text-sm ml-1">({totalReviews})</span>
        </h2>
        {stats.count > 0 && (
          <div className="flex items-center gap-2 bg-craveo-50 px-3 py-1.5 rounded-full">
            <StarRating value={Math.round(stats.avgRating * 2) / 2} mode="display" size="text-sm" />
            <span className="text-craveo-700 font-semibold text-sm">{stats.avgRating} avg</span>
          </div>
        )}
      </div>

      {/* rating breakdown - computed across ALL reviews on the backend, not just this page */}
      {stats.count > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Rating breakdown
          </h3>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.breakdown[star] || 0
              const pct = stats.count > 0 ? Math.round((count / stats.count) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-10 text-gray-500 flex-shrink-0">{star} star</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-craveo-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-400 text-right flex-shrink-0">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

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

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
