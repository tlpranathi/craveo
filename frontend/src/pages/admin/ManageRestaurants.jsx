import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import API from "../../services/api"

const emptyForm = { name: "", location: "", cuisine: "", rating: "", image: "", owner: "" }

export default function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [initialLoad, setInitialLoad] = useState(true) // separate flag for initial load


  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [uploading, setUploading] = useState(false)

  const fetchRestaurants = async () => {
    if (initialLoad) setLoading(true) // only show skeleton on first load
    try { 
      const res = await API.get("/restaurants")
      setRestaurants(res.data.data.restaurants)
    } catch (err) {
      setError("Failed to load restaurants.")
    } finally {
      setLoading(false)
      setInitialLoad(false) // mark initial load done
     }
  }

  const fetchOwners = async () => {
    try {
      const res = await API.get("/admin/owners")
      setOwners(res.data.data.owners)
    } catch (err) {
      // non-fatal - owner dropdown just won't have options, rest of the page still works
    }
  }

  useEffect(() => { fetchRestaurants(); fetchOwners() }, [])

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
      image: r.image || "",
      owner: r.owner?._id || r.owner || "",
    })
    setFormError("")
    setShowModal(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setFormError("")
    try {
      const formData = new FormData()
      formData.append("image", file)
      // don't set Content-Type manually - the browser needs to add its own multipart boundary, which gets lost if we hardcode the header
      const res = await API.post("/restaurants/upload", formData)
      setForm((prev) => ({ ...prev, image: res.data.data.url }))
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to upload image.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      // owner is optional - send null instead of an empty string so it clears
      // cleanly on the backend instead of getting cast to an invalid ObjectId
      const payload = {
       ...form,
        rating: form.rating ? Number(form.rating) : undefined,
        owner: form.owner || null,
      }

      if (editingId) {
        await API.put(`/restaurants/${editingId}`, payload)
        // update just row in state - no refetch needed
        setRestaurants((prev) =>
          prev.map((r) => (r._id === editingId? {...r, ...payload, owner: owners.find(o => o._id === form.owner) || null} : r))
        )
      } else {
        const res = await API.post("/restaurants", payload)
        // append new restaurant to existing list - no refetch needed
        setRestaurants((prev) => [...prev, res.data.data.restaurant])
      }

      setShowModal(false)
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
      <h2 className="text-lg font-semibold text-gray-900">
        Restaurants
      </h2>
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
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {restaurants.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.cuisine}</td>
                  <td className="px-4 py-3 text-gray-600">{r.location}</td>
                  <td className="px-4 py-3 text-gray-600">⭐ {r.averageRating}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.owner?.name || (
                      <span className="text-amber-600 text-xs font-medium">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/admin/restaurants/${r._id}/menu`} state={{ restaurantName: r.name }} className="text-craveo-600 hover:underline font-medium">
                    Menu
                    </Link>
                    <button onClick={() => openEdit(r)} className="text-gray-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(r._id, r.name)} className="text-red-500 hover:underline font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {restaurants.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">                    
                    No restaurants yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/*create/edit modal*/}
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
              <input type="text" placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <input type="text" placeholder="Cuisine (e.g. Italian)" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Photo</label>
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200" />
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-craveo-50 file:text-craveo-700 file:font-medium hover:file:bg-craveo-100"/>
                {uploading && <p className="text-xs text-gray-400 mt-1">Uploading...</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Owner</label>
                <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 bg-white">
                  <option value="">Unassigned</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading} className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
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