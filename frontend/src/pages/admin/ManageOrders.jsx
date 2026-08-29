import { useState, useEffect } from "react"
import API from "../../services/api"
import socket from "../../services/socketService"

const STAGES = ["pending", "confirmed", "preparing", "delivered"]

const statusStyles = {
  pending:   "bg-craveo-100 text-craveo-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      // admin needs ALL orders, not just "my orders"
      const res = await API.get("/orders")
      setOrders(res.data.data.orders)
    } catch (err) {
      setError("Failed to load orders.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  useEffect(() => {
    const handleNewOrder = ({ order }) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === order._id)) return prev
        return [order, ...prev]
      })
    }

   const handleStatusUpdate = ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      )
    }

    socket.on("newOrder", handleNewOrder)
    socket.on("orderStatusUpdated", handleStatusUpdate)

    return () => {
      socket.off("newOrder", handleNewOrder)
      socket.off("orderStatusUpdated", handleStatusUpdate)
    }
  }, [])


  const advanceStatus = async (order) => {
    const currentIndex = STAGES.indexOf(order.status)
    const nextStatus = STAGES[currentIndex + 1]
    if (!nextStatus) return

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

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-5">All orders</h2>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {orders.map((order) => {
            const nextStatus = STAGES[STAGES.indexOf(order.status) + 1]
            const isFinal = order.status === "delivered" || order.status === "cancelled"

            return (
              <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">
                    {order.user?.name || "User"} · {order.restaurant?.name || "Restaurant"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleString()} · ₹{order.totalPrice}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>

                  {!isFinal && (
                    <button
                      onClick={() => advanceStatus(order)}
                      disabled={updatingId === order._id}
                      className="bg-craveo-500 hover:bg-craveo-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {updatingId === order._id ? "..." : `Mark ${nextStatus}`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {orders.length === 0 && (
            <p className="text-center text-gray-400 py-8">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  )
}