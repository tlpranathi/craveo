import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

// protected routes that should be only accessible by the admins
const AdminRoute = ({ children }) => {
  const { user, token } = useAuth() // get user and token

  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== "superadmin") return <Navigate to="/" replace />
  
  // user is authenticated and has admin privileges
  // render the protected admin page 
  return children
}

export default AdminRoute
