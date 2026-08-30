import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import API from "../services/api"
import Pagination from "../components/Pagination";
import socket from "../services/socketService"


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
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  
  // Add at the top of your Orders component, after your state declarations
useEffect(() => {
  socket.on("connect", () => console.log("Socket connected:", socket.id))
  socket.on("disconnect", () => console.log("Socket disconnected"))
  socket.on("orderStatusUpdated", (data) => console.log("Status update received:", data))

  return () => {
    socket.off("connect")
    socket.off("disconnect")
    socket.off("orderStatusUpdated")
  }
}, [])


  // joins each order's socket room and listens for status updates
  useEffect(() => {
    if (orders.length === 0) return

    // join room for every order on the page
    orders.forEach((order) => {
      socket.emit("joinOrderRoom", order._id)
    })

    // listen for status updates
    const handleStatusUpdate = ({ orderId, status }) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      )
    }

    socket.on("orderStatusUpdated", handleStatusUpdate)

    // cleanup — leave rooms and remove listener when component unmounts
    return () => {
      orders.forEach((order) => {
        socket.emit("leaveOrderRoom", order._id)
      })
      socket.off("orderStatusUpdated", handleStatusUpdate)
    }
}, [orders.map(o => o._id).join(",")]) // depends on actual IDs not just length


  useEffect(() => {
  const timers = orders.map((order) => {
    const windowStart = order.payment?.paidAt || order.createdAt;
    const remaining =
      60000 - (Date.now() - new Date(windowStart).getTime());

    if (remaining > 0 && order.status === "pending") {
      return setTimeout(() => {
        setOrders((prev) => [...prev]);
      }, remaining);
    }

    return null;
  });

  return () => timers.forEach(clearTimeout);
}, [orders]);

  // debounce the search input so we're not firing a request per keystroke
  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // reset to page 1 whenever the search term actually changes (post-debounce) - otherwise you could land on a page number that doesn't exist for the new results
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    const fetchOrders = async () => {
  try {
    const res = await API.get("/orders/my-orders", {
      params: { page, limit: 4, search: debouncedSearch || undefined },
    })
    setOrders(res.data.data.orders)
    setPage(res.data.data.page)
    setTotalPages(res.data.data.totalPages)
    setTotalOrders(res.data.data.totalOrders)

  } catch (err) {
    setError("Failed to load orders.")
  } finally {
    setLoading(false)
  }
}
    fetchOrders()
  }, [page, debouncedSearch])

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


  const isWithinCancelWindow = (order) => {
    const windowStart = order.payment?.paidAt || order.createdAt
    return Date.now() - new Date(windowStart).getTime() < 60000
  }

  const canCancelOrder = (order) =>
    order.status === "pending" && isWithinCancelWindow(order)
  
  
  return (
    <div>
      <div className="bg-craveo-600 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">My Orders</h1>
          <p className="text-craveo-100 text-sm">{totalOrders} order{totalOrders !== 1 ? "s" : ""} placed</p>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by restaurant name..." className="mt-4 w-full px-4 py-2.5 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"/>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {location.state?.paymentSuccess && (
  <div className="border-l-4 border-green-500 bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
    <p className="font-semibold">
    Payment Successful!</p>
    <p>Your order has been placed successfully.</p>
  </div>
)}
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
            {debouncedSearch ? (
              <>
                <p className="text-gray-700 text-lg font-medium mb-1">No orders match "{debouncedSearch}"</p>
                <p className="text-gray-400 text-sm mb-6">Try a different restaurant name</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 text-lg font-medium mb-1">No orders yet</p>
                <p className="text-gray-400 text-sm mb-6">Your order history will show up here</p>
              </>
            )}
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
                  <div className="flex flex-col items-end gap-2">
  <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusStyles[order.status]}`}>
    {order.status}
  </span>

  <span
    className={`text-xs font-semibold px-3 py-1 rounded-full ${
      order.payment?.status === "Successful"
        ? "bg-green-100 text-green-700"
        : order.payment?.status === "Pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    Payment: {order.payment?.status || "Pending"}
  </span>
</div>
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
                    <div className="relative group">
                      <button
                        onClick={() => canCancelOrder(order) && handleCancel(order._id)}
                        disabled={!canCancelOrder(order)}
                        className={`text-sm font-medium border px-3 py-1.5 rounded-full transition ${
                          canCancelOrder(order)
                            ? "text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                            : "text-gray-300 border-gray-200 cursor-not-allowed"
                        }`}
                      >
                        Cancel order
                      </button>

                      {/* Tooltip — only shows when disabled */}
                      {!canCancelOrder(order) && (
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-l rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Can't cancel after 1 minute
                          <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  {(() => {
                    const isDelivered = order.status === "delivered"
                    const isReviewed = order.hasReview
                    const isDisabled = !isDelivered || isReviewed

                    const tooltipMsg = isReviewed ? "Review already submitted" : !isDelivered? "Available after order is delivered" : null
                    return (
                      <div className="relative group">
                        <button onClick={() => !isDisabled && reviewOrder(order)} disabled={isDisabled} className={`text-sm font-medium border px-3 py-1.5 rounded-full transition ${
                            !isDisabled ? "text-craveo-600 hover:text-craveo-700 border-craveo-200 hover:bg-craveo-50" : "text-gray-300 border-gray-200 cursor-not-allowed"}`}>
                          {isReviewed ? "Reviewed ✓" : "Write a review"}
                        </button>

                        {isDisabled && tooltipMsg && (
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-l rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {tooltipMsg}
                            <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800" />
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onPageChange={(newPage) => { setPage(newPage) 
        window.scrollTo({top: 0, behavior: "smooth",})}}/>
      </div>
    </div>
  )
}