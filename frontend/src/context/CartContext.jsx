import { createContext, useContext, useState } from "react"
import { AlertTriangle } from "lucide-react"

// create global cart context
const CartContext = createContext(null)

export const CartProvider = ({children}) => {
  // initialize cart from localStorage
  // preserves cart after page refresh
  const[cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("craveo_cart")
    return stored ? JSON.parse(stored) : []
  })

  // holds the item the user just tried to add while the cart already has
  // items from a different restaurant. Setting this (instead of adding
  // straight away) is what drives the "replace cart?" confirmation modal
  // below - Swiggy-style, so the user gets to choose rather than being
  // blocked outright.
  const [pendingItem, setPendingItem] = useState(null)

  // helper function - keeps React state and localStorage in sync
  const syncToStorage = (items) => {
    localStorage.setItem("craveo_cart", JSON.stringify(items))
    setCartItems(items)
  }

  // add item to cart
  // if item already exists -> increase quantity
  const addToCart = (item) => {
   // check restaurant restriction
   if (cartItems.length > 0 && cartItems[0].restaurantId !== item.restaurantId) {
    // don't add it yet - ask the user whether to replace their cart first
    setPendingItem(item)
    return
   }

   // check if item already exists
   const existing = cartItems.find((i) => i._id === item._id)

   if (existing) {
    const updated = cartItems.map((i) => 
      i._id === item._id ? {...i, quantity: i.quantity + 1} : i
    )
    syncToStorage(updated)
    return

   }
   // adding a new item
   syncToStorage([...cartItems, {...item, quantity: 1}])
  }

  // user confirmed the replacement - wipe the old cart and start fresh
  // with the item they were trying to add
  const confirmReplaceCart = () => {
    if (!pendingItem) return
    syncToStorage([{...pendingItem, quantity: 1}])
    setPendingItem(null)
  }

  // user backed out - keep the existing cart untouched
  const cancelReplaceCart = () => setPendingItem(null)

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
    <CartContext.Provider value = {{cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, pendingItem, confirmReplaceCart, cancelReplaceCart}}>
      {children}

      {/* replace-cart confirmation modal - renders above whatever page is active */}
      {pendingItem && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 px-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 rounded-full bg-craveo-50 text-craveo-500 flex items-center justify-center mb-4">
              <AlertTriangle size={22} />
            </div>

            <h3 className="font-semibold text-gray-900 text-lg mb-1">Replace cart items?</h3>

            <p className="text-sm text-gray-500 mb-6">
              {pendingItem.restaurantName
                ? `Your cart already has items from another restaurant. Adding "${pendingItem.name}" from ${pendingItem.restaurantName} will clear your current cart and start a new order.`
                : "Your cart already has items from another restaurant. Adding this item will clear your current cart and start a new order."}
            </p>

            <div className="flex gap-3">
              <button onClick={cancelReplaceCart} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-full font-medium hover:bg-gray-50 transition">
                No, keep cart
              </button>
              <button onClick={confirmReplaceCart} className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-2.5 rounded-full font-medium transition">
                Yes, replace
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}
  
// custom hook for accessing cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside CartProvider")
  return context
}