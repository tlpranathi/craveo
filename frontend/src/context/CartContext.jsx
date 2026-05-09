// client/src/context/CartContext.jsx

import { createContext, useContext, useState } from "react"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("craveo_cart")
    return stored ? JSON.parse(stored) : []
  })

  // ── Helper: sync every change to localStorage ──────────────────────────────
  const syncToStorage = (items) => {
    localStorage.setItem("craveo_cart", JSON.stringify(items))
    setCartItems(items)
  }

  // ── Add item (or increase qty if already in cart) ──────────────────────────
  const addToCart = (item) => {
    const existing = cartItems.find((i) => i._id === item._id)

    if (existing) {
      const updated = cartItems.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      )
      syncToStorage(updated)
    } else {
      syncToStorage([...cartItems, { ...item, quantity: 1 }])
    }
  }

  // ── Remove item completely ─────────────────────────────────────────────────
  const removeFromCart = (itemId) => {
    const updated = cartItems.filter((i) => i._id !== itemId)
    syncToStorage(updated)
  }

  // ── Update quantity directly (e.g. + / - buttons) ─────────────────────────
  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) return removeFromCart(itemId)
    const updated = cartItems.map((i) =>
      i._id === itemId ? { ...i, quantity } : i
    )
    syncToStorage(updated)
  }

  // ── Clear entire cart (after order placed) ─────────────────────────────────
  const clearCart = () => {
    localStorage.removeItem("craveo_cart")
    setCartItems([])
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}