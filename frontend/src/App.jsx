import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"

import Home from "./pages/Home"
import Cart from "./pages/Cart"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Restaurants from "./pages/Restaurants"
import Menu from "./pages/Menu"
import Orders from "./pages/Orders"
import Profile from "./pages/Profile"
import AdminRoute from "./components/AdminRoute"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageRestaurants from "./pages/admin/ManageRestaurants"
import ManageMenu from "./pages/admin/ManageMenu"
import ManageOrders from "./pages/admin/ManageOrders"
import OwnerRoute from "./components/OwnerRoute"
import OwnerDashboard from "./pages/owner/OwnerDashboard"
import OwnerOrders from "./pages/owner/OwnerOrders"
import OwnerMenu from "./pages/owner/OwnerMenu"
import OwnerReviews from "./pages/owner/OwnerReviews"


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/menu/:id" element={<Menu />} />
          <Route path="/cart" element={<ProtectedRoute> <Cart /> </ProtectedRoute>}/>
          <Route path="/orders" element = {<ProtectedRoute><Orders /></ProtectedRoute>}/>
          <Route path="/profile" element = {<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
            <Route path="restaurants" element={<ManageRestaurants />} />
            <Route path="restaurants/:restaurantId/menu" element={<ManageMenu />} />
            <Route path="orders" element={<ManageOrders />} />
          </Route> 
          <Route path="/owner" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>}>
            <Route path="orders" element={<OwnerOrders />} />
            <Route path="menu" element={<OwnerMenu />} />
            <Route path="reviews" element={<OwnerReviews />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App