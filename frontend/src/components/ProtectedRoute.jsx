import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children }) => {
    const { token } = useAuth()
    // if no token, kick user to login page
    if (!token) {
        return <Navigate to="/login" replace />
    }

    // otherwise render the page normally
    return children
}

export default ProtectedRoute