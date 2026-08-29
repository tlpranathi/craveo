import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import API from "../services/api"
import { useAuth } from "../context/AuthContext"
import { Eye, EyeOff } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await API.post("/auth/login", { email, password })
      const { token, user } = res.data.data
      login(user, token)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] grid lg:grid-cols-2">
      
      <div className="hidden lg:flex flex-col justify-between bg-craveo-600 text-white p-12 relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700">
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight">Craveo</h1>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-3xl font-semibold leading-tight mb-4">
            Every craving,<br />delivered.
          </p>
          <p className="text-craveo-100 text-sm">
            Order from your favourite local restaurants in just a few taps.
          </p>
        </div>

        <div className="relative z-10 flex gap-6 text-sm text-craveo-100">
          <span>150+ restaurants</span>
          <span>·</span>
          <span>15 locations</span>
        </div>
      </div>

      {/* form panel */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-white">
        <div className="w-full max-w-sm mx-auto">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back!</h2>
          <p className="text-gray-500 text-sm mb-8">Log in to continue exploring Bengaluru's best restaurants.</p>

          {error && (
            <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
            </div>

            <div>
               <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-craveo-600 hover:text-craveo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-0 py-2 pr-8 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-craveo-600 text-white py-3.5 rounded-full font-medium transition-colors disabled:opacity-50 mt-2">
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            New to Craveo?{" "}
            <Link to="/register" className="text-gray-900 font-semibold hover:text-craveo-600">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login