// client/src/pages/Login.jsx

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"
import { useAuth } from "../context/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")      // show errors to user
  const [loading, setLoading] = useState(false) // prevent double-submit

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")        // clear previous error
    setLoading(true)

    try {
      const res = await API.post("/auth/login", { email, password })
      const { token, user } = res.data.data

      // Save to context + localStorage
      login(user, token)

      // Redirect to home after login
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {/* Show error message to user */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  )
}

export default Login