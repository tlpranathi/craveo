// client/src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid black", display: "flex", gap: "20px", alignItems: "center" }}>
      
      {/* Always visible */}
      <Link to="/"><strong>Craveo</strong></Link>
      <Link to="/restaurants">Restaurants</Link>

      {user ? (
        // ── Logged in ────────────────────────────────
        <>
          <Link to="/cart">Cart</Link>
          <span>Hi, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
          <Link to="/orders">Orders</Link>
        </>
      ) : (
        // ── Logged out ───────────────────────────────
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}

    </nav>
  )
}