import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const OwnerRoute = ({ children }) => {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== "owner") return <Navigate to="/" replace />
  return children
}

export default OwnerRoute