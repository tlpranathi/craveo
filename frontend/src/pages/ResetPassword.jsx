import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import API from "../services/api"
import { Eye, EyeOff } from "lucide-react"

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await API.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      // give the user a moment to read the confirmation before redirecting
      setTimeout(() => navigate("/login"), 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired reset link. Please request a new one.")
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
            Almost there,<br />set a new password.
          </p>
        </div>
        <div className="relative z-10 flex gap-6 text-sm text-craveo-100">
          <span>150+ restaurants</span>
          <span>·</span>
          <span>15 locations</span>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-white">
        <div className="w-full max-w-sm mx-auto">

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h2>
          <p className="text-gray-500 text-sm mb-8">Choose a new password for your account.</p>

          {error && (
            <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {success ? (
            <div className="border-l-4 border-craveo-400 bg-craveo-50 text-craveo-700 text-sm px-4 py-3 mb-5">
              Password reset successfully. Redirecting you to log in...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-0 py-2 pr-8 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Confirm new password
                </label>
                <input type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-craveo-600 text-white py-3.5 rounded-full font-medium transition-colors disabled:opacity-50 mt-2">
                {loading ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-8">
            Remembered your password?{" "}
            <Link to="/login" className="text-gray-900 font-semibold hover:text-craveo-600">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword