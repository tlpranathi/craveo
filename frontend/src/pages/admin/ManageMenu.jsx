import { useState, useEffect } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import API from "../../services/api"

const emptyForm = { name: "", price: "", description: "", image: "" }

export default function ManageMenu() {
  const { restaurantId } = useParams()
  const location = useLocation()
  const restaurantName = location.state?.restaurantName
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/menu/${restaurantId}`)
      setMenu(res.data.data)
    } catch (err) {
      setError("Failed to load menu.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMenu() }, [restaurantId])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({
      name: item.name || "",
      price: item.price ?? "",
      description: item.description || "",
      image: item.image || "",
    })
    setFormError("")
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      const payload = { ...form, price: Number(form.price), restaurantId }

      if (editingId) {
        await API.put(`/menu/${editingId}`, payload)
      } else {
        await API.post("/menu", payload)
      }

      setShowModal(false)
      fetchMenu()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save menu item.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await API.delete(`/menu/${id}`)
      setMenu((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item.")
    }
  }

  return (
    <div>
      <Link to="/admin/restaurants" className="text-gray-500 hover:text-craveo-600 text-sm font-medium mb-3 inline-block">
        ← Back to restaurants
      </Link>

      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {restaurantName || "Menu"}
          </h2>
          <p className="text-sm text-gray-500">
            Manage menu items
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-craveo-500 hover:bg-craveo-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          + Add item
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
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {menu.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-craveo-600 font-medium">₹{item.price}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-xs">{item.description}</td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(item)} className="text-gray-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      className="text-red-500 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {menu.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    No menu items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? "Edit item" : "Add item"}
            </h3>

            {formError && (
              <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Item name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <input type="number" placeholder="Price" required min="0" value={form.price} step="0.01" onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <input type="text" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"/>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-craveo-500 hover:bg-craveo-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50">
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