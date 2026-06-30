// client/src/pages/admin/ManageRestaurants.jsx

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../../services/api"

const emptyForm = { name: "", location: "", cuisine: "", rating: "", image: "" }

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchRestaurants = async () => {
    setLoading(true)
    try {
      const res = await API.get("/restaurants")
      setRestaurants(res.data.data.restaurants)
    } catch (err) {
      setError("Failed to load restaurants.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRestaurants() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (r) => {
    setEditingId(r._id)
    setForm({
      name: r.name || "",
      location: r.location || "",
      cuisine: r.cuisine || "",
      rating: r.rating ?? "",
      image: r.image || "",
    })
    setFormError("")
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      const payload = { ...form, rating: form.rating ? Number(form.rating) : undefined }

      if (editingId) {
        await API.put(`/restaurants/${editingId}`, payload)
      } else {
        await API.post("/restaurants", payload)
      }

      setShowModal(false)
      fetchRestaurants()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save restaurant.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await API.delete(`/restaurants/${id}`)
      setRestaurants((prev) => prev.filter((r) => r._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete restaurant.")
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Restaurants</h2>
        <button
          onClick={openCreate}
          className="bg-craveo-500 hover:bg-craveo-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          + Add restaurant
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Cuisine</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurants.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.cuisine}</td>
                  <td className="px-4 py-3 text-gray-600">{r.location}</td>
                  <td className="px-4 py-3 text-gray-600">⭐ {r.rating}</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link
                      to={`/admin/restaurants/${r._id}/menu`}
                      className="text-craveo-600 hover:underline font-medium"
                    >
                      Menu
                    </Link>
                    <button onClick={() => openEdit(r)} className="text-gray-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r._id, r.name)}
                      className="text-red-500 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No restaurants yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create/Edit modal ───────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? "Edit restaurant" : "Add restaurant"}
            </h3>

            {formError && (
              <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="Name" required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />
              <input
                type="text" placeholder="Cuisine (e.g. Italian)"
                value={form.cuisine}
                onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />
              <input
                type="text" placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />
              <input
                type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />
              <input
                type="text" placeholder="Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}