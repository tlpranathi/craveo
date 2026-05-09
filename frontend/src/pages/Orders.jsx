// client/src/pages/Orders.jsx

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

// Status badge color map
const statusColors = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
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
      // Update local state — no need to refetch
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      )
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel order.")
    }
  }

  if (loading) return <p style={{ padding: "20px" }}>Loading orders...</p>
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <div>
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate("/restaurants")}>Order Now</button>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            style={{ border: "1px solid #ccc", margin: "10px 0", padding: "15px", borderRadius: "8px" }}
          >
            {/* ── Order header ───────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <strong>{order.restaurant?.name || "Restaurant"}</strong>
                <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <span
                style={{
                  background: statusColors[order.status],
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {order.status}
              </span>
            </div>

            {/* ── Items ──────────────────────────────────────────────── */}
            {order.items.map((item, index) => (
              <p key={index} style={{ margin: "4px 0" }}>
                {item.name} × {item.quantity} — ₹{item.price * item.quantity}
              </p>
            ))}

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
              <strong>Total: ₹{order.totalPrice}</strong>
              {order.status === "pending" && (
                <button
                  onClick={() => handleCancel(order._id)}
                  style={{ color: "red", background: "none", border: "1px solid red", padding: "4px 10px", cursor: "pointer", borderRadius: "4px" }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}