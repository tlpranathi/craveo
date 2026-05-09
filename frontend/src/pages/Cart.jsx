// client/src/pages/Cart.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import API from "../services/api"

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    setError("")
    setLoading(true)

    try {
      // All items must be from same restaurant — get restaurantId from first item
      const restaurantId = cartItems[0].restaurantId

      if (!restaurantId) {
        throw new Error("Restaurant info missing. Please re-add items.")
      }

      await API.post("/orders", {
        restaurantId,
        items: cartItems,
      })

      clearCart()
      navigate("/orders")
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to place order.")
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Your Cart</h2>
        <p>Your cart is empty.</p>
        <button onClick={() => navigate("/restaurants")}>Browse Restaurants</button>
      </div>
    )
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Cart ({totalItems} items)</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {cartItems.map((item) => (
        <div
          key={item._id}
          style={{ border: "1px solid #ccc", margin: "10px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <div>
            <h3>{item.name}</h3>
            <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
            <button onClick={() => removeFromCart(item._id)} style={{ color: "red" }}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
        <h3>Total: ₹{totalPrice}</h3>
        <button onClick={clearCart} style={{ marginRight: "10px" }} disabled={loading}>
          Clear Cart
        </button>
        <button onClick={handlePlaceOrder} disabled={loading}>
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </div>
    </div>
  )
}