import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  // form input states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // stores error message shown to users
  const [error, setError] = useState("")

  // tracks login request status
  const [loading, setLoading] = useState(false)
  
  // AuthContext login function
  const { login } = useAuth()

  // React Router navigation hook
  const navigate = useNavigate()

  // handle login form submission
  const handleLogin = async(e) => {
    // prevent browser refresh
    e.preventDefault()
    
    // clear old errors
    setError("")
    
    // start loading states
    setLoading(true)
    try {
      // send login request to backend
      const res = await API.post("/auth/login", {email, password})
      
      // extract token and user data
      const { token, user } = res.data.data

      // save login to AuthContext
      // also persists to localStorage
      login(user, token)

      // redirects to home page
      navigate("/")
    } catch (error) {
      // show backend error message if available
      setError(err.response?.data?.message || "Login failed. Try again.")
    } finally {
      // stop loading states
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      {/* display error message */}
      {error && <p style={{color: "red"}}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required>
        </input>

        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required>
        </input>

        <button type="submit" disabled={loading}>
          {loading? "Logging in..." : "Login"}
        </button>
      </form>

      <p>Don't have an account?<Link to="/register">Register</Link></p>
    </div>
  )
}

export default Login
