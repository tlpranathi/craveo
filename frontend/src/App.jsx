import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Restaurants from "./pages/Restaurants"
import Menu from "./pages/Menu"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/menu/:id" element={<Menu />} />
          <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>}/>
          <Route path="/orders" element = {<ProtectedRoute><Orders /></ProtectedRoute>}/>
          <Route path="/profile" element = {<ProtectedRoute><Profile /></ProtectedRoute>}/>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App