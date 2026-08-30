import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import API from "../services/api"
import { useCart } from "../context/CartContext"
import StarRating from "../components/StarRating"
import ReviewSection from "../components/ReviewSection"
import { Search, SlidersHorizontal } from "lucide-react"

const SORT_OPTIONS = [
  { value: "default", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
]


const Menu = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [restaurantInfo, setRestaurantInfo] = useState(null)
  const [showReviews, setShowReviews] = useState(false)

  // menu filters
  const [menuSearch, setMenuSearch] = useState("")
  const [sortBy, setSortBy] = useState("default")
  const [maxPrice, setMaxPrice] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const { cartItems, addToCart, updateQuantity } = useCart()

  // fetch menu items
  useEffect(() => {
    // reset filters when navigating to a different restaurant's menu
    setMenuSearch("")
    setSortBy("default")
    setMaxPrice("")
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

  // highest price on the menu - used as the upper bound for the price filter
  const highestPrice = useMemo(() => {
    if (menu.length === 0) return 0
    return Math.max(...menu.map((item) => item.price))
  }, [menu])

  // apply search + price filter, then sort - all client-side since the
  // full menu for a restaurant is already loaded
  const filteredMenu = useMemo(() => {
    let items = [...menu]

    if (menuSearch.trim()) {
     const term = menuSearch.trim().toLowerCase()
      items = items.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      )
    }

    if (maxPrice !== "") {
      items = items.filter((item) => item.price <= Number(maxPrice))
    }

    switch (sortBy) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        items.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }

    return items
  }, [menu, menuSearch, maxPrice, sortBy])

  const filtersActive = menuSearch.trim() !== "" || maxPrice !== "" || sortBy !== "default"

  const clearFilters = () => {
    setMenuSearch("")
    setSortBy("default")
    setMaxPrice("")
  }


  const fetchRestaurantInfo = async () => {
    try {
      const res = await API.get(`/restaurants/${id}`);
      setRestaurantInfo(res.data.data);
    } catch (err) {
      // fail silently
    }
  };

  useEffect(() => {
    fetchRestaurantInfo();
  }, [id]);

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

      {/* filter bar */}
      {!loading && !error && menu.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search this menu..." value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
            </div>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition whitespace-nowrap ${
                showFilters || filtersActive
                  ? "bg-craveo-50 border-craveo-300 text-craveo-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-craveo-500" />}
            </button>
          </div>

          {showFilters && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Sort by
                </label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-craveo-400">
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {highestPrice > 0 && (
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                    Max price: {maxPrice === "" ? `₹${highestPrice}` : `₹${maxPrice}`}
                  </label>
                  <input type="range" min="0" max={highestPrice} value={maxPrice === "" ? highestPrice : maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full accent-craveo-500"/>
                </div>
              )}

              {filtersActive && (
                <button onClick={clearFilters} className="text-sm font-medium text-craveo-600 hover:text-craveo-700 whitespace-nowrap sm:self-end sm:pb-2">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* no results after filtering */}
      {!loading && !error && menu.length > 0 && filteredMenu.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-700 text-lg font-medium mb-1">No items match your filters</p>
          <p className="text-gray-400 text-sm mb-4">Try a different search term or widen your price range</p>
          <button onClick={clearFilters} className="text-craveo-600 font-medium text-sm hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* menu items */}
      {!loading && !error && filteredMenu.length > 0 && (
        <div className="space-y-4">
          {filteredMenu.map((item) => {
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
                    <button onClick={() => addToCart({...item, restaurantName: restaurantInfo?.name})} className="bg-craveo-500 hover:bg-craveo-600 text-white px-5 py-2 rounded-lg font-medium transition whitespace-nowrap">
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
                value={Math.round((restaurantInfo.averageRating || 0) * 2) / 2}
                mode="display"
                size="text-xl"
              />
              <span className="text-gray-700 font-medium">
                {restaurantInfo.averageRating > 0 ? restaurantInfo.averageRating : "No ratings yet"}
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
            <ReviewSection restaurantId={id} />
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