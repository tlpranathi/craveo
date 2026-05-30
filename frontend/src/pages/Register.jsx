import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"
import { useAuth } from "../context/AuthContext"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await API.post("/auth/signup", { name, email, password })
      const { token, user } = res.data.data
      login(user, token)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required/>
        <input type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  )
}

export default Register