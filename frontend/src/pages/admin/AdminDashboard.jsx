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
        const res2 = await API.get("/orders")
        // console.log("Restaurants response:", res.data);
        // console.log("Orders response:", res2.data);
        setStats((s) => ({ ...s, restaurants: res.data.data.totalRestaurants, orders: res2.data.data.totalOrders }))
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
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* stat cards */}
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Restaurants</p>
          <p className="text-3xl font-bold text-craveo-600">{stats.restaurants}</p>
        </div>
         <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-gray-500 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-craveo-600">{stats.orders}</p>
        </div>
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

      {/* nested page renders here */}
      <Outlet />
    </div>
  )
}