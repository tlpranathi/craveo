import { useState, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import API from "../../services/api"

export default function AdminDashboard() {
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/admin/stats")
        setStats(res.data.data)
      } catch (err) {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const navItems = [
    { path: "/admin/restaurants", label: "Restaurants" },
    { path: "/admin/orders", label: "Orders" },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  const stat = (label, value, sub) => (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-craveo-600">{loading ? "—" : value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide overview</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stat("Total Revenue", `₹${stats?.totalRevenue?.toLocaleString() || 0}`, "from delivered orders")}
        {stat("Total Orders", stats?.totalOrders || 0, "all time")}
        {stat("Avg Platform Rating", stats?.averageRating ? `⭐ ${stats.averageRating}` : "N/A", "across all restaurants")}
      </div>

      {/* tab nav */}
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

      <Outlet />
    </div>
  )
}