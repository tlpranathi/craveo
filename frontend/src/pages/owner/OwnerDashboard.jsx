import { useState, useEffect } from "react"
import { Link, Outlet, useLocation } from "react-router-dom"
import API from "../../services/api"

export default function OwnerDashboard() {
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/owner/stats")
        setStats(res.data.data)
      } catch (err) {
        // fail silently — stats non-critical
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const navItems = [
    { path: "/owner/orders", label: "Orders" },
    { path: "/owner/menu", label: "Menu" },
    { path: "/owner/reviews", label: "Reviews" },
  ]

  const isActive = (path) => location.pathname.startsWith(path)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900">Restaurant Dashboard</h1>
        <p className="text-gray-500 text-s mt-1">Manage your restaurant, menu, and orders</p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-900 font-bold text-s mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-craveo-600">
            {loading ? "—" : `₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          </p>
          <p className="text-s text-gray-400 mt-1">from delivered orders</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="ttext-gray-900 font-bold text-s mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-craveo-600">
            {loading ? "—" : stats?.totalOrders || 0}
          </p>
          <p className="text-s text-gray-400 mt-1">all time</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-900 font-bold text-s mb-1">Average Rating</p>
          <p className="text-2xl font-bold text-craveo-600">
            {loading ? "—" : `⭐ ${stats?.averageRating || "No ratings yet"}`}
          </p>
          <p className="text-s text-gray-400 mt-1">based on reviews</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-900 font-bold text-s mb-2">Top Items</p>
          {loading ? (
            <p className="text-gray-400 text-sm">—</p>
          ) : stats?.popularItems?.length ? (
            <ol className="space-y-0.5">
              {stats.popularItems.slice(0, 3).map((item, i) => (
                <li key={i} className="text-xs text-gray-600 flex justify-between">
                  <span className="truncate mr-2">{i + 1}. {item.name}</span>
                  <span className="text-craveo-600 font-medium flex-shrink-0">{item.totalSold} sold</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-400 text-s">No orders yet</p>
          )}
        </div>
      </div>

      {/* tab nav */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`px-4 py-2.5 font-medium text-sm border-b-2 transition ${ isActive(item.path) ? "border-craveo-500 text-craveo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {item.label}
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  )
}