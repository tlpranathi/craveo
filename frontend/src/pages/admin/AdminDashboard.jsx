// client/src/pages/admin/AdminDashboard.jsx

import { useState, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import API from "../../services/api"

export default function AdminDashboard() {
  const location = useLocation()
  const [stats, setStats] = useState({ restaurants: 0, orders: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/restaurants")
        setStats((s) => ({ ...s, restaurants: res.data.data.totalRestaurants || res.data.data.restaurants?.length || 0 }))
      } catch (err) {
        // fail silently — stats are non-critical
      }
    }
    fetchStats()
  }, [])

  const navItems = [
    { path: "/admin/restaurants", label: "Restaurants" },
    { path: "/admin/orders", label: "Orders" },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <span className="bg-craveo-100 text-craveo-700 text-xs font-semibold px-3 py-1 rounded-full">
          Admin access
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Restaurants</p>
          <p className="text-3xl font-bold text-craveo-600">{stats.restaurants}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`px-4 py-2.5 font-medium text-sm border-b-2 transition ${
              isActive(item.path)
                ? "border-craveo-500 text-craveo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Nested page renders here */}
      <Outlet />
    </div>
  )
}