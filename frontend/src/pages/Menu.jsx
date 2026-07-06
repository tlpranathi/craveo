import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import API from "../services/api"
import { useCart } from "../context/CartContext"
import StarRating from "../components/StarRating"
import ReviewSection from "../components/ReviewSection"

const Menu = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [restaurantInfo, setRestaurantInfo] = useState(null)
  const [showReviews, setShowReviews] = useState(false)

  const { cartItems, addToCart, updateQuantity } = useCart()

  // check if redirected from Orders page with ?review=true
  const autoOpenReview = new URLSearchParams(location.search).get("review") === "true"

  // if redirected from Orders, auto-expand the review section
  useEffect(() => {
    if (autoOpenReview) setShowReviews(true)
  }, [autoOpenReview])

  // fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true)
      try {
        const res = await API.get(`/menu/${id}`)
        setMenu(res.data.data)
      } catch (err) {
        setError("Failed to load menu. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [id])

  // fetch restaurant info for rating summary
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const res = await API.get(`/restaurants/${id}`)
        setRestaurantInfo(res.data.data)
      } catch (err) {
        // fail silently — rating summary is non-critical
      }
    }
    fetchRestaurantInfo()
  }, [id])

  const getQuantity = (itemId) => {
    const found = cartItems.find((i) => i._id === itemId)
    return found ? found.quantity : 0
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* back button */}
      <button
        onClick={() => navigate("/restaurants")}
        className="text-gray-500 hover:text-craveo-600 text-sm font-medium mb-4 flex items-center gap-1"
      >
        ← Back to restaurants
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Menu</h1>

      {/* loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* empty state */}
      {!loading && !error && menu.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No items found on this menu.</p>
        </div>
      )}

      {/* menu items */}
      {!loading && !error && menu.length > 0 && (
        <div className="space-y-4">
          {menu.map((item) => {
            const qty = getQuantity(item._id)
            return (
              <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 items-center hover:shadow-sm transition">
                {/* image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none" }}/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                      🍴
                    </div>
                  )}
                </div>

                {/* details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-craveo-600 font-semibold mt-1">₹{item.price}</p>
                </div>

                {/* add / quantity controls */}
                <div className="flex-shrink-0">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)} className="bg-craveo-500 hover:bg-craveo-600 text-white px-5 py-2 rounded-lg font-medium transition whitespace-nowrap">
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-craveo-50 rounded-lg px-2 py-1.5">
                      <button onClick={() => updateQuantity(item._id, qty - 1)} className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-md transition">
                        −
                      </button>
                      <span className="font-semibold text-craveo-700 w-4 text-center">{qty}</span>
                      <button onClick={() => updateQuantity(item._id, qty + 1)} className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-md transition">
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* rating summary + review toggle */}
      {restaurantInfo && (
        <div className="mt-10 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StarRating
                value={Math.round((restaurantInfo.rating || 0) * 2) / 2}
                mode="display"
                size="text-xl"
              />
              <span className="text-gray-700 font-medium">
                {restaurantInfo.rating > 0 ? restaurantInfo.rating : "No ratings yet"}
              </span>
              {restaurantInfo.numberOfReviews > 0 && (
                <span className="text-gray-400 text-sm">
                  ({restaurantInfo.numberOfReviews} review{restaurantInfo.numberOfReviews !== 1 ? "s" : ""})
                </span>
              )}
            </div>

            <button
              onClick={() => setShowReviews(!showReviews)}
              className="text-craveo-600 font-medium text-sm hover:underline"
            >
              {showReviews ? "Hide reviews ↑" : "View all reviews ↓"}
            </button>
          </div>

          {/* inline expandable review section */}
          {showReviews && (
            <ReviewSection
              restaurantId={id}
              autoOpen={autoOpenReview}
            />
          )}
        </div>
      )}

      {/* floating cart bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-craveo-500 text-white py-4 px-6 flex items-center justify-between shadow-lg">
          <span className="font-medium">
            {cartItems.reduce((sum, i) => sum + i.quantity, 0)} items in cart
          </span>
          <button
            onClick={() => navigate("/cart")}
            className="bg-white text-craveo-600 px-5 py-2 rounded-lg font-semibold hover:bg-craveo-50 transition"
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  )
}

export default Menu