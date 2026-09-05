import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import API from "../../services/api"

const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrdersRequired: "0",
  minOrderValue: "",
  maxDiscountAmount: "",
  expiresAt: "",
  isActive: true,
}

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons")
      setCoupons(res.data.data.coupons)
    } catch (err) {
      setError("Failed to load coupons.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormError("")
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEditingId(c._id)
    setForm({
      code: c.code,
      description: c.description || "",
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrdersRequired: String(c.minOrdersRequired ?? 0),
      minOrderValue: c.minOrderValue ? String(c.minOrderValue) : "",
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
    })
    setFormError("")
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrdersRequired: form.minOrdersRequired === "" ? 0 : Number(form.minOrdersRequired),
        minOrderValue: form.minOrderValue === "" ? 0 : Number(form.minOrderValue),
        maxDiscountAmount: form.maxDiscountAmount === "" ? undefined : Number(form.maxDiscountAmount),
        expiresAt: form.expiresAt || undefined,
        isActive: form.isActive,
      }

      if (editingId) {
        await API.patch(`/coupons/${editingId}`, payload)
      } else {
        await API.post("/coupons", payload)
      }

      setShowModal(false)
      fetchCoupons()
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save coupon.")
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (c) => {
    try {
      await API.patch(`/coupons/${c._id}`, { isActive: !c.isActive })
      setCoupons((prev) => prev.map((x) => (x._id === c._id ? { ...x, isActive: !x.isActive } : x)))
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update coupon.")
    }
  }

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    try {
      await API.delete(`/coupons/${id}`)
      setCoupons((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete coupon.")
    }
  }

  const describeDiscount = (c) =>
    c.discountType === "percentage"
      ? `${c.discountValue}% off${c.maxDiscountAmount ? ` (up to ₹${c.maxDiscountAmount})` : ""}`
      : `₹${c.discountValue} off`

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Coupons <span className="text-gray-400 font-normal text-sm ml-1">({coupons.length})</span>
        </h2>
        <button
          onClick={openCreate}
          className="bg-craveo-500 hover:bg-craveo-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
        >
          + Add coupon
        </button>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Unlocks after</th>
                <th className="px-4 py-3 font-medium">Min order</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600">{describeDiscount(c)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.minOrdersRequired > 0 ? `${c.minOrdersRequired} delivered order${c.minOrdersRequired !== 1 ? "s" : ""}` : "Anyone"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.minOrderValue > 0 ? `₹${c.minOrderValue}` : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                        c.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-gray-600 hover:underline font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c._id, c.code)} className="text-red-500 hover:underline font-medium">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No coupons yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">
              {editingId ? "Edit coupon" : "Add coupon"}
            </h3>

            {formError && (
              <div className="border-l-4 border-red-400 bg-red-50 text-red-700 text-sm px-4 py-2.5 mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text" placeholder="CODE (e.g. WELCOME50)" required value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 uppercase"
              />
              <input
                type="text" placeholder="Description (optional, shown to customers)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Discount type</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400 bg-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {form.discountType === "percentage" ? "Discount (%)" : "Discount (₹)"}
                  </label>
                  <input
                    type="number" min="1" required value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
                  />
                </div>
              </div>

              {form.discountType === "percentage" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max discount amount (₹, optional cap)</label>
                  <input
                    type="number" min="0" placeholder="No cap" value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unlocks after N delivered orders</label>
                  <input
                    type="number" min="0" value={form.minOrdersRequired}
                    onChange={(e) => setForm({ ...form, minOrdersRequired: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">0 = anyone can use it</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Min order value (₹)</label>
                  <input
                    type="number" min="0" placeholder="No minimum" value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expires on (optional)</label>
                <input
                  type="date" value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-craveo-400"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-craveo-500 focus:ring-craveo-400"
                />
                Active
              </label>

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
