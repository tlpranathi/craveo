const StarRating = ({ value, onChange, mode = "display", size = "text-xl" }) => {
  const stars = [1, 2, 3, 4, 5]

  const handleClick = (e, star) => {
    if (mode !== "input" || !onChange) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const isHalf = clickX < rect.width / 2
    onChange(isHalf ? star - 0.5 : star)
  }

  const getStarFill = (star) => {
    if (value >= star) return "full"
    if (value >= star - 0.5) return "half"
    return "empty"
  }

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => {
        const fill = getStarFill(star)
        return (
          <span key={star} onClick={(e) => handleClick(e, star)} className={`${size} relative select-none ${mode === "input" ? "cursor-pointer" : "cursor-default"}`} style={{ display: "inline-block" }}>
            {/* base empty star */}
            <span className="text-gray-300">★</span>

            {/* filled overlay — full or half */}
            {fill !== "empty" && (
              <span className="absolute inset-0 text-yellow-400 overflow-hidden" style={{ width: fill === "half" ? "50%" : "100%" }}>
                ★
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default StarRating