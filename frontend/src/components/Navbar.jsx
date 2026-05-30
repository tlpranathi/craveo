import {Link, useNavigate} from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Navbar() {
  // get logged-in user and logout function
  const { user, logout } = useAuth()
  
  // hook for programatic navigation
  const navigate = useNavigate()
  
  // logout user and redirect to login page
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // navigation bar container
  return(
    <nav style={{padding: "10px", borderBottom: "1px solid black", display: "flex", gap: "20px", alignItems: "center"}}>
      {/* always visible */}
      <Link to="/"><strong>Craveo</strong></Link>
      <Link to="/restaurants">Restaurants</Link>

      {user ? (
        <>
          <Link to="/cart">Cart</Link>
          <span>Hi, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
        </>
      ) : (
        <>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  )
}
