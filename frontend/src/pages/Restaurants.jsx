// import { useState, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import API from "../services/api"

// // predefined cuisine filter options
// const CUISINES = ["All", "Indian", "Chinese", "Italian", "Mexican", "Fast Food"]

// const Restaurants = () => {
//   // stores fetched restaurants
//   const [restaurants, setRestaurants] = useState([])
//   // loading state during API requests
//   const [loading, setLoading] = useState(true)
//   // stores error message
//   const [error, setError] = useState("")

//   // search text entered by user
//   const [search, setSearch] = useState("")
//   // selected cuisine filter
//   const [cuisine, setCuisine] = useState("")

//   // navigation hook
//   const navigate = useNavigate()

//   // fetch restaurants whenever search or cuisine changes
//   useEffect(() => {
//     const fetchRestaurants = async () => {
//       setLoading(true)
//       setError("")
//       try {
//         // build query parameters dynamically 
//         const params = {}
//         if (search) params.search = search
//         if (cuisine && cuisine !== "All") params.cuisine = cuisine
        
//         // send backend req
//         const res = await API.get("/restaurants", { params })
//         setRestaurants(res.data.data) // save restaurant data
//       } catch (err) {
//         setError("Failed to load restaurants. Please try again.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     // debounce search input
//     // wait 400ms before fetching
//     const debounce = setTimeout(fetchRestaurants, 400)
//     return () => clearTimeout(debounce) // cleanup old timer
//   }, [search, cuisine]) // re runs when either changes

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Restaurants</h2>
//       <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
//         <input
//           type="text" placeholder="Search by name or location..." value={search} onChange={(e) => setSearch(e.target.value)}
//           style={{ padding: "8px 12px", flex: 1, minWidth: "200px" }}/>

//         <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}
//           style={{ padding: "8px 12px" }} >
//           {CUISINES.map((c) => (
//             <option key={c} value={c === "All" ? "" : c}>
//               {c}
//             </option>
//           ))}
//         </select>

//         {(search || cuisine) && (
//           <button
//             onClick={() => { setSearch(""); setCuisine("") }}>
//             Clear
//           </button>
//         )}
//       </div>

//       {loading && <p>Loading restaurants...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {!loading && !error && restaurants.length === 0 && (
//         <p>No restaurants found. Try a different search.</p>
//       )}

//       {!loading && restaurants.map((r) => (
//         <div
//           key={r._id}
//           style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}>
//           <h3 style={{ margin: "0 0 6px" }}>{r.name}</h3>

//           <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
//             {r.cuisine && <span>🍽 {r.cuisine}</span>}
//             {r.location && <span style={{ marginLeft: "12px" }}>📍 {r.location}</span>}
//             {r.rating && <span style={{ marginLeft: "12px" }}>⭐ {r.rating}</span>}
//           </div>

//           <button onClick={() => navigate(`/menu/${r._id}`)}>
//             View Menu
//           </button>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default Restaurants



// client/src/pages/Restaurants.jsx

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

const CUISINES = ["All", "Indian", "Chinese", "Italian", "Mexican", "Fast Food", "Japanese", "Street Food"]

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [cuisine, setCuisine] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true)
      setError("")
      try {
        const params = {}
        if (search) params.search = search
        if (cuisine && cuisine !== "All") params.cuisine = cuisine

        const res = await API.get("/restaurants", { params })
        setRestaurants(res.data.data.restaurants)
      } catch (err) {
        setError("Failed to load restaurants. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchRestaurants, 400)
    return () => clearTimeout(debounce)
  }, [search, cuisine])

  return (
    <div>
      {/* ── Brand hero header ───────────────────────────────────────── */}
      <div className="bg-craveo-600 relative overflow-hidden">
        {/* <div className="absolute -top-10 -right-10 w-56 h-56 bg-craveo-500 rounded-full opacity-40" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-craveo-700 rounded-full opacity-30" /> */}

        <div className="max-w-6xl mx-auto px-4 py-10 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            What are you craving today?
          </h1>
          <p className="text-craveo-100 mb-6">Order from the best restaurants near you</p>

          {/* Search bar embedded in hero */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white shadow-sm"
            />

            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="px-4 py-3 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-white bg-white shadow-sm"
            >
              {CUISINES.map((c) => (
                <option key={c} value={c === "All" ? "" : c}>
                  {c}
                </option>
              ))}
            </select>

            {(search || cuisine) && (
              <button
                onClick={() => { setSearch(""); setCuisine("") }}
                className="px-4 py-3 rounded-full bg-craveo-700 text-white hover:bg-craveo-800 transition whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results section ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {!loading && !error && restaurants.length > 0 && (
          <p className="text-gray-500 text-sm mb-5">
            <span className="text-craveo-600 font-semibold">{restaurants.length}</span> restaurants found
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 text-lg font-medium mb-1">No restaurants found</p>
            <p className="text-gray-400 text-sm">Try a different search or cuisine filter</p>
          </div>
        )}

        {/* Restaurant grid */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r) => (
              <div
                key={r._id}
                onClick={() => navigate(`/menu/${r._id}`)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-craveo-200 transition-all duration-200 group"
              >
                {/* Image with orange overlay gradient on hover */}
                <div className="h-40 bg-craveo-50 overflow-hidden relative">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-craveo-300 text-4xl">
                      🍽
                    </div>
                  )}

                  {/* Rating badge floats on image now, top-right */}
                  {r.rating && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 text-gray-900 text-sm font-semibold px-2.5 py-1 rounded-full shadow-sm">
                      ⭐ {r.rating}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-2 group-hover:text-craveo-600 transition-colors">
                    {r.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    {r.cuisine && (
                      <span className="bg-craveo-100 text-craveo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {r.cuisine}
                      </span>
                    )}
                    {r.location && <span className="text-gray-400">📍 {r.location}</span>}
                  </div>

                  <button className="w-full bg-craveo-500 group-hover:bg-craveo-600 text-white py-2.5 rounded-lg font-medium transition-colors">
                    View Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Restaurants