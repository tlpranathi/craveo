const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  // smart page number logic — show first, last, current ± 1, with ellipsis
  const getPageNumbers = () => {
    const pages = []

    if (totalPages <= 5) {
      // show all if 5 or fewer
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1) // always show first

    if (page > 3) pages.push("...") // left ellipsis

    // pages around current
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)

    if (page < totalPages - 2) pages.push("...") // right ellipsis

    pages.push(totalPages) // always show last

    return pages
  }

  return (
    <div className="flex justify-center items-center gap-1.5 mt-10">

      {/* previous */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-xl border border-craveo-200 text-craveo-600 text-sm font-medium hover:bg-craveo-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      {/* page numbers */}
      {getPageNumbers().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-stone-400 text-sm">
            ···
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
              page === p
                ? "bg-craveo-500 text-white shadow-sm shadow-craveo-200"
                : "border border-stone-200 text-stone-600 hover:border-craveo-300 hover:text-craveo-600 hover:bg-craveo-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-xl border border-craveo-200 text-craveo-600 text-sm font-medium hover:bg-craveo-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  )
}

export default Pagination