import { useState, useEffect } from "react"
import API from "../../services/api"

const STAGES = ["pending", "confirmed", "preparing", "delivered"]

const statusStyles = {
  pending:   "bg-craveo-100 text-craveo-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function OwnerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/owner/orders")
        setOrders(res.data.data.orders)
      } catch (err) {
        setError("Failed to load orders.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const advanceStatus = async (order) => {
    const currentIndex = STAGES.indexOf(order.status)
    const nextStatus = STAGES[currentIndex + 1]
    if (!nextStatus) return

    // owner can only confirm after 1 minute from payment (not backend enforced yet - frontend only)
    if (nextStatus === "confirmed") {
      const windowStart = order.payment?.paidAt || order.createdAt
      const elapsed = Date.now() - new Date(windowStart).getTime()
      if (elapsed < 60000) {
        const remaining = Math.ceil((60000 - elapsed) / 1000)
        alert(`Please wait ${remaining} seconds before confirming — giving the customer time to cancel.`)
        return
      }
    }

    setUpdatingId(order._id)
    try {
      await API.patch(`/orders/${order._id}/status`, { status: nextStatus })
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: nextStatus } : o))
      )
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.")
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading orders...</p>
  if (error) return <p className="text-red-600 text-sm">{error}</p>

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        Orders <span className="text-gray-400 font-normal text-sm ml-1">({orders.length})</span>
      </h2>

      {orders.length === 0 && (
        <p className="text-center text-gray-400 py-8">No orders yet.</p>
      )}

      <div className="space-y-3">
        {orders.map((order) => {
          const currentIndex = STAGES.indexOf(order.status)
          const nextStatus = STAGES[currentIndex + 1]
          const isFinal = order.status === "delivered" || order.status === "cancelled"
          const windowStart = order.payment?.paidAt || order.createdAt
          const elapsed = Date.now() - new Date(windowStart).getTime()
          const withinCancelWindow = elapsed < 60000

          return (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {order.user?.name || "Customer"}
                    <span className="text-gray-400 text-xs ml-2">{order.user?.email}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()} · ₹{order.totalPrice}
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs text-gray-500">
                        {item.name} × {item.quantity}
                        <span className="text-gray-400"> — ₹{item.price * item.quantity}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>

                  {!isFinal && (
                    <div className="relative group">
                      <button
                        onClick={() => advanceStatus(order)}
                        disabled={updatingId === order._id || (nextStatus === "confirmed" && withinCancelWindow)}
                        className="bg-craveo-500 hover:bg-craveo-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {updatingId === order._id ? "..." : `Mark ${nextStatus}`}
                      </button>

                      {/* tooltip for confirm cooldown */}
                      {nextStatus === "confirmed" && withinCancelWindow && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-l rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Customer can still cancel — wait 1 minute
                          <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}