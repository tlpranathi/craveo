// client/src/pages/Menu.jsx

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import API from "../services/api"
import { useCart } from "../context/CartContext"

const Menu = () => {
  const { id } = useParams()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const { cartItems, addToCart, updateQuantity } = useCart()

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await API.get(`/menu/${id}`)
        setMenu(res.data.data)
      } catch (err) {
        setError("Failed to load menu. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [id])

  // Get quantity of a specific item currently in cart
  const getQuantity = (itemId) => {
    const found = cartItems.find((i) => i._id === itemId)
    return found ? found.quantity : 0
  }

  if (loading) return <p>Loading menu...</p>
  if (error) return <p style={{ color: "red" }}>{error}</p>

  return (
    <div style={{ padding: "20px" }}>
      <h2>Menu</h2>

      {menu.length === 0 ? (
        <p>No items found.</p>
      ) : (
        menu.map((item) => {
          const qty = getQuantity(item._id)

          return (
            <div
              key={item._id}
              style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
            >
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p>₹{item.price}</p>

              {qty === 0 ? (
                // ── Not in cart yet ──────────────────────────────────────────
                <button onClick={() => addToCart(item)}>Add to Cart</button>
              ) : (
                // ── Already in cart — show quantity controls ─────────────────
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button onClick={() => updateQuantity(item._id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => updateQuantity(item._id, qty + 1)}>+</button>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default Menu