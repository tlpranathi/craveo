// import { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import { useCart } from "../context/CartContext"
// import API from "../services/api"

// export default function Cart() {
//   const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState("")
//   const navigate = useNavigate()

//   const handlePlaceOrder = async () => {
//     setError("")
//     setLoading(true)

//     try {
//       if (cartItems.length === 0) throw new AppError("cart is empty")

//       // all items must be from same restaurant — get restaurantId from first item
//       const restaurantId = cartItems[0].restaurantId

//       if (!restaurantId) {
//         throw new Error("Restaurant info missing. Please re-add items.")
//       }


//       if(cartItems.length === 0) return 

//       await API.post("/orders", { restaurantId, items: cartItems, })

//       clearCart()
//       navigate("/orders")
//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Failed to place order.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (cartItems.length === 0) {
//     return (
//       <div style={{ padding: "20px" }}>
//         <h2>Your Cart</h2>
//         <p>Your cart is empty.</p>
//         <button onClick={() => navigate("/restaurants")}>Browse Restaurants</button>
//       </div>
//     )
//   }

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Your Cart ({totalItems} items)</h2>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {cartItems.map((item) => (
//         <div
//           key={item._id}
//           style={{ border: "1px solid #ccc", margin: "10px", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
//         >
//           <div>
//             <h3>{item.name}</h3>
//             <p>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</p>
//           </div>

//           <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
//             <button disabled={loading} onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
//             <span>{item.quantity}</span>
//             <button disabled={loading} onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
//             <button disabled={loading} onClick={() => removeFromCart(item._id)} style={{ color: "red" }}>🗑</button>
//           </div>
//         </div>
//       ))}

//       <div style={{ marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
//         <h3>Total: ₹{totalPrice}</h3>
//         <button onClick={clearCart} style={{ marginRight: "10px" }} disabled={loading}>
//           Clear Cart
//         </button>
//         <button onClick={handlePlaceOrder} disabled={loading}>
//           {loading ? "Placing Order..." : "Place Order"}
//         </button>
//       </div>
//     </div>
//   )
// }


// client/src/pages/Cart.jsx — key sections updated

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
      const restaurantId = cartItems[0].restaurantId
      if (!restaurantId) throw new Error("Restaurant info missing. Please re-add items.")
      await API.post("/orders", { restaurantId, items: cartItems })
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-craveo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          🛒
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <button
          onClick={() => navigate("/restaurants")}
          className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-3 rounded-full font-medium transition"
        >
          Browse restaurants
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* ── Orange header strip ─────────────────────────────────────── */}
      <div className="bg-craveo-600 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Your Cart</h1>
          <p className="text-craveo-100 text-sm">{totalItems} item{totalItems !== 1 ? "s" : ""} ready to order</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="border-l-4 border-red-400 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-craveo-200 transition-colors"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{item.price} × {item.quantity} = <span className="text-craveo-600 font-semibold">₹{item.price * item.quantity}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-craveo-50 rounded-full px-2 py-1.5">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-full transition"
                  >
                    −
                  </button>
                  <span className="font-semibold text-craveo-700 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-full transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary — scalloped top edge like a receipt ───────── */}
        <div className="relative">
          {/* Scalloped edge: row of small circles cut into the top */}
          <svg className="w-full h-3 text-gray-50" viewBox="0 0 200 10" preserveAspectRatio="none">
            <path d="M0,10 L0,5 Q5,0 10,5 Q15,10 20,5 Q25,0 30,5 Q35,10 40,5 Q45,0 50,5 Q55,10 60,5 Q65,0 70,5 Q75,10 80,5 Q85,0 90,5 Q95,10 100,5 Q105,0 110,5 Q115,10 120,5 Q125,0 130,5 Q135,10 140,5 Q145,0 150,5 Q155,10 160,5 Q165,0 170,5 Q175,10 180,5 Q185,0 190,5 Q195,10 200,5 L200,10 Z" fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
          </svg>

          <div className="bg-white border-x border-b border-gray-200 rounded-b-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-craveo-600">₹{totalPrice}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={clearCart}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition disabled:opacity-50"
              >
                Clear cart
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-3 rounded-full font-medium transition disabled:opacity-50"
              >
                {loading ? "Placing order..." : "Place order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}