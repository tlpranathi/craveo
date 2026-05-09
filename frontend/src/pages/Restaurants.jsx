// client/src/pages/Restaurants.jsx

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

// Hardcoded cuisine options — add more as your DB grows
const CUISINES = ["All", "Indian", "Chinese", "Italian", "Mexican", "Fast Food"]

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ── Search + filter state ─────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [cuisine, setCuisine] = useState("")

  const navigate = useNavigate()

  // ── Fetch whenever search or cuisine changes ──────────────────────────────
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      setError("")
      try {
        // Build query string dynamically
        const params = {}
        if (search) params.search = search
        if (cuisine && cuisine !== "All") params.cuisine = cuisine

        const res = await API.get("/restaurants", { params })
        setRestaurants(res.data.data)
      } catch (err) {
        setError("Failed to load restaurants. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    // ── Debounce search input — wait 400ms after user stops typing ──────────
    // Prevents an API call on every single keystroke
    const debounce = setTimeout(fetchRestaurants, 400)
    return () => clearTimeout(debounce)
  }, [search, cuisine]) // re-runs when either changes

  return (
    <div style={{ padding: "20px" }}>
      <h2>Restaurants</h2>

      {/* ── Search + Filter controls ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", flex: 1, minWidth: "200px" }}
        />

        <select
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          style={{ padding: "8px 12px" }}
        >
          {CUISINES.map((c) => (
            <option key={c} value={c === "All" ? "" : c}>
              {c}
            </option>
          ))}
        </select>

        {/* Clear button — only shows when a filter is active */}
        {(search || cuisine) && (
          <button
            onClick={() => { setSearch(""); setCuisine("") }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Results ────────────────────────────────────────────────────── */}
      {loading && <p>Loading restaurants...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && restaurants.length === 0 && (
        <p>No restaurants found. Try a different search.</p>
      )}

      {!loading && restaurants.map((r) => (
        <div
          key={r._id}
          style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}
        >
          <h3 style={{ margin: "0 0 6px" }}>{r.name}</h3>

          <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
            {r.cuisine && <span>🍽 {r.cuisine}</span>}
            {r.location && <span style={{ marginLeft: "12px" }}>📍 {r.location}</span>}
            {r.rating && <span style={{ marginLeft: "12px" }}>⭐ {r.rating}</span>}
          </div>

          <button onClick={() => navigate(`/menu/${r._id}`)}>
            View Menu
          </button>
        </div>
      ))}
    </div>
  )
}

export default Restaurants