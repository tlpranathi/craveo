import { createContext, useContext, useState } from "react"

// create global cart context
const CartContext = createContext(null)

export const CartProvider = ({children}) => {
  // initialize cart from localStorage
  // preserves cart after page refresh
  const[cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("craveo_cart")
    return stored ? JSON.parse(stored) : []
  })

  // helper function - keeps React state and localStorage in sync
  const syncToStorage = (items) => {
    localStorage.setItem("craveo_cart", JSON.stringify(items))
    setCartItems(items)
  }

  // add item to cart
  // if item already exists -> increase quantity
  const addToCart = (item) => {
    const existing = cartItems.find((i) => i._id === item._id)

    if (existing) {
      const updated = cartItems.map((i) => 
      i._id === item._id ? {...i, quantity: i.quantity + 1} : i)
      syncToStorage(updated)
    } else {
      syncToStorage([...cartItems, {...item, quantity: 1}])
    }
  }

  // remove item completely from cart
  const removeFromCart = (itemId) => {
    const updated = cartItems.filter((i) => i._id !== itemId)
    syncToStorage(updated)
  }

  // update item quantity directly, used by +/- buttons
  const updateQuantity = (itemId, quantity) => {
    // remove item if quantity becomes zero
    if (quantity <= 0) return removeFromCart(itemId)
    const updated = cartItems.map((i) => 
    i._id === itemId ? {...i, quantity} : i)
    syncToStorage(updated)
  }

  // clean cart after successful order
  const clearCart = () => {
    localStorage.removeItem("craveo_cart")
    setCartItems([])
  }
  // total number of items in cart and total cart value
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price*i.quantity, 0)

  return(
    <CartContext.Provider value = {{cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice}}>
      {children}
    </CartContext.Provider>
  )
}
  
// custom hook for accessing cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
} 
