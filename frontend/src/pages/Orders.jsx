import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

const statusStyles = {
  pending:   "bg-craveo-100 text-craveo-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

// dotted progress trail
const STAGES = ["pending", "confirmed", "preparing", "delivered"]

function StatusTrail({ status }) {
  if (status === "cancelled") return null
  const activeIndex = STAGES.indexOf(status)

  return (
    <div className="flex items-center gap-1 mt-3">
      {STAGES.map((stage, i) => (
        <div key={stage} className="flex items-center flex-1">
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              i <= activeIndex ? "bg-craveo-500" : "bg-gray-200"
            }`}
          />
          {i < STAGES.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-1 ${
                i < activeIndex
                  ? "bg-craveo-500"
                  : "bg-gray-200 bg-[length:6px_2px] bg-repeat-x"
              }`}
              style={
                i >= activeIndex
                  ? { backgroundImage: "repeating-linear-gradient(90deg, #e5e7eb 0, #e5e7eb 4px, transparent 4px, transparent 8px)" }
                  : {}
              }
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my-orders")
        setOrders(res.data.data.orders)
      } catch (err) {
        setError("Failed to load orders.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const handleCancel = async (orderId) => {
    try {
      await API.patch(`/orders/${orderId}/status`, { status: "cancelled" })
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o)))
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order.")
    }
  }

  const reviewOrder = (order) => {
  navigate(`/menu/${order.restaurant._id}?review=true&orderId=${order._id}`)
}

  return (
    <div>
      <div className="bg-craveo-600 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-craveo-100 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="border-l-4 border-red-400 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-craveo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              📦
            </div>
            <p className="text-gray-700 text-lg font-medium mb-1">No orders yet</p>
            <p className="text-gray-400 text-sm mb-6">Your order history will show up here</p>
            <button onClick={() => navigate("/restaurants")} className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-3 rounded-full font-medium transition">
              Order now
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-craveo-200 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.restaurant?.name || "Restaurant"}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </div>

                <StatusTrail status={order.status} />

                <div className="border-t border-gray-100 mt-4 pt-3 space-y-1">
                  {order.items.map((item, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {item.name} × {item.quantity}
                      <span className="text-gray-400"> — ₹{item.price * item.quantity}</span>
                    </p>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className="font-bold text-craveo-600">₹{order.totalPrice}</span>
                  {order.status === "pending" && (
                    <button onClick={() => handleCancel(order._id)} className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-3 py-1.5 rounded-full hover:bg-red-50 transition">
                      Cancel order
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  {order.status === "delivered" ? (
                    <button onClick={() => reviewOrder(order)} className="text-craveo-600 hover:text-craveo-700 text-sm font-medium border border-craveo-200 px-3 py-1.5 rounded-full hover:bg-craveo-50 transition">
                      Write a review
                    </button>
                  ) : (
                    <button disabled className="text-gray-300 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-full cursor-not-allowed" title="Available after order is delivered">
                      Write a review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}