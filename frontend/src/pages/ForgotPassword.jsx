import { useState } from "react"
import { Link } from "react-router-dom"
import API from "../services/api"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await API.post("/auth/forgot-password", { email })
      // backend always returns a generic success message (even if the email
      // isn't registered) so we never reveal whether an account exists
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
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
            Forgot your<br />password?
          </p>
          <p className="text-craveo-100 text-sm">
            No worries - we'll email you a link to reset it.
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

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h2>
          <p className="text-gray-500 text-sm mb-8">
            Enter the email linked to your account and we'll send you a reset link.
          </p>

          {error && (
            <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="border-l-4 border-craveo-400 bg-craveo-50 text-craveo-700 text-sm px-4 py-3 mb-5">
              If an account with that email exists, a password reset link has been sent. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-0 py-2 border-0 border-b-2 border-gray-200 focus:outline-none focus:border-craveo-500 transition-colors"/>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-craveo-600 text-white py-3.5 rounded-full font-medium transition-colors disabled:opacity-50 mt-2">
                {loading ? "Sending link..." : "Send reset link"}
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

export default ForgotPassword