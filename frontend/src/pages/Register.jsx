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
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-white order-2 lg:order-1">
        <div className="w-full max-w-sm mx-auto">

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-500 text-sm mb-8">Join Craveo and start ordering in minutes</p>

          {error && (
            <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Full name
              </label>
              <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-craveo-600 text-white py-3.5 rounded-full font-medium transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-900 font-semibold hover:text-craveo-600">
              Log in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-between bg-craveo-600 text-white p-12 relative overflow-hidden order-1 lg:order-2 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">

        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">Craveo</h1>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-3xl font-semibold leading-tight mb-4">
            Your next favorite<br />restaurant awaits.
          </p>
          <p className="text-craveo-100 text-sm">
Create an account to discover Bengaluru's best restaurants.          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-craveo-100">
          <span>150+ restaurants</span>
          <span>·</span>
          <span>Fast ordering</span>
        </div>
      </div>
    </div>
  )
}

export default Register