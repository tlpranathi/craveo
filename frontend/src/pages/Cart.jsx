import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import API from "../services/api"
import { ShoppingCart } from "lucide-react"

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
  setError("");
  setLoading(true);

  try {
    const restaurant = cartItems[0].restaurantId;

    if (!restaurant) {
      throw new Error("Restaurant info missing. Please re-add items.");
    }

    // create razorpay order
    const { data } = await API.post("/payment/create-order", {
      restaurant,
      items: cartItems.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity
      }))
    });

    const paymentData = data.data;

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.razorpayOrderId,
      modal: {
        ondismiss: async () => {
          // user closed the checkout without paying - mark it failed instead of leaving a phantom "pending" order in the DB that no one can ever act on
          try {
            await API.post("/payment/mark-failed", { orderId: paymentData.orderId});
          } catch {
            // best effort - not blocking ui on this
          }
          setLoading(false);
        }
    },
      name: "Craveo",
      description: "Food Order",

      handler: async function (response) {
      try {
        await API.post("/payment/verify", {
            orderId: paymentData.orderId,
            razorpay_order_id:
                response.razorpay_order_id,
            razorpay_payment_id:
                response.razorpay_payment_id,
            razorpay_signature:
                response.razorpay_signature
        });
        clearCart();
        navigate("/orders", {
          state: {
            paymentSuccess: true
          }
        });
    } catch (err) {
        setError("Payment verification failed.");
    }
},
      theme: {
        color: "#f97316"
      }
    };
    const razorpay = new window.Razorpay(options);
    // actual payment failures (card declined, insufficient funds, etc.) fire this
    // event on the Razorpay instance itself - the checkout's own `handler` above
    // is never called in this case, so without this listener the order silently
    // stays "pending" forever and the customer sees no error at all
    razorpay.on("payment.failed", async (response) => {
     try {
       await API.post("/payment/mark-failed", {
         orderId: paymentData.orderId,
         reason: response.error?.description
       });
     } catch {
       // best-effort
     }
     setError(response.error?.description || "Payment failed. Please try again.");
     setLoading(false);
    });
    razorpay.open();
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Failed to place order.");
  } finally {
    setLoading(false);
  }
};

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-craveo-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          <ShoppingCart></ShoppingCart>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <button onClick={() => navigate("/restaurants")} className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-3 rounded-full font-medium transition">
          Browse restaurants
        </button>
      </div>
    )
  }

  return (
    <div>
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
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-craveo-200 transition-colors">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  ₹{item.price} × {item.quantity} = <span className="text-craveo-600 font-semibold">₹{item.price * item.quantity}</span>
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-craveo-50 rounded-full px-2 py-1.5">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-full transition">
                    −
                  </button>
                  <span className="font-semibold text-craveo-700 w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-craveo-600 font-bold hover:bg-craveo-100 rounded-full transition">
                    +
                  </button>
                </div>

                <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* order summary*/}
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
              <button onClick={clearCart} disabled={loading} className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition disabled:opacity-50">
                Clear cart
              </button>
              <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-3 rounded-full font-medium transition disabled:opacity-50">
                {loading ? "Placing order..." : "Place order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}