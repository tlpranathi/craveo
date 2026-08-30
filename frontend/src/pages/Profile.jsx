import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import API from "../services/api"
import { ShoppingBag, Wallet, MessageSquareText } from "lucide-react"

export default function Profile() {
  const { user, login, token } = useAuth()

  // profile statistics
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/users/profile/stats")
        setStats(res.data.data)
      } catch (err) {
        // fail silently - stats are a nice-to-have, not core profile functionality
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  // edit profile state
  const [name, setName] = useState(user?.name || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")
  const [profileError, setProfileError] = useState("")

  // change password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setProfileError("")
    setProfileMsg("")
    setProfileLoading(true)
    try {
      const res = await API.put("/users/profile", { name })
      login(res.data.data, token) // refresh context with updated user
      setProfileMsg("Profile updated successfully")
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordMsg("")
    setPasswordLoading(true)
    try {
      await API.put("/users/change-password", { currentPassword, newPassword })
      setPasswordMsg("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to change password")
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile summary card — scalloped bottom edge */}
      <div className="mb-6">
        <div className="bg-craveo-600 rounded-t-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-craveo-100 text-sm">{user?.email}</p>
              {user?.role === "admin" && (
                <span className="inline-block mt-1 bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Scalloped edge cut from the bottom of the orange card */}
        <svg className="w-full h-3 -mt-px" viewBox="0 0 200 10" preserveAspectRatio="none">
          <path d="M0,0 L0,5 Q5,10 10,5 Q15,0 20,5 Q25,10 30,5 Q35,0 40,5 Q45,10 50,5 Q55,0 60,5 Q65,10 70,5 Q75,0 80,5 Q85,10 90,5 Q95,0 100,5 Q105,10 110,5 Q115,0 120,5 Q125,10 130,5 Q135,0 140,5 Q145,10 150,5 Q155,0 160,5 Q165,10 170,5 Q175,0 180,5 Q185,10 190,5 Q195,0 200,5 L200,0 Z" fill="#ea580c" />
        </svg>
      </div>

      {/* Profile statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-9 h-9 rounded-full bg-craveo-50 text-craveo-500 flex items-center justify-center mx-auto mb-2">
            <ShoppingBag size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {statsLoading ? "—" : stats?.totalOrders ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total orders</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-9 h-9 rounded-full bg-craveo-50 text-craveo-500 flex items-center justify-center mx-auto mb-2">
            <Wallet size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {statsLoading ? "—" : `₹${stats?.totalSpent ?? 0}`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total spent</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="w-9 h-9 rounded-full bg-craveo-50 text-craveo-500 flex items-center justify-center mx-auto mb-2">
            <MessageSquareText size={18} />
          </div>
          <p className="text-xl font-bold text-gray-900">
            {statsLoading ? "—" : stats?.reviewsCount ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Reviews written</p>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Edit profile</h3>

        {profileError && (
          <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
            {profileError}
          </div>
        )}
        {profileMsg && (
          <div className="border-l-4 border-green-400 bg-green-50 text-green-700 text-sm px-4 py-2.5 mb-4">
            {profileMsg}
          </div>
        )}

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 focus:border-craveo-400"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="bg-craveo-500 hover:bg-craveo-600 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {profileLoading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Change password</h3>

        {passwordError && (
          <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
            {passwordError}
          </div>
        )}
        {passwordMsg && (
          <div className="border-l-4 border-green-400 bg-green-50 text-green-700 text-sm px-4 py-2.5 mb-4">
            {passwordMsg}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 focus:border-craveo-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 focus:border-craveo-400"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-gray-900 hover:bg-craveo-600 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
          >
            {passwordLoading ? "Updating..." : "Change password"}
          </button>
        </form>
      </div>
    </div>
  )
}