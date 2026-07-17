export default function VerticalCarousel({ images, reverse = false }) {
  // duplicate images so scrolling looks continuous
  const allImages = [...images, ...images]

  return (
    <div className="h-[500px] w-full">
      <div
        className={`flex flex-col ${
          reverse ? "animate-scrollDown" : "animate-scrollUp"
        }`}
      >
        {allImages.map((img, index) => (
          <img key={index} src={img} alt="" loading={index < 3 ? "eager" : "lazy"} fetchPriority={index < 3 ? "high" : "auto"} className="h-[650px] w-full object-cover shadow-lg flex-shrink-0"
          />
        ))}
      </div>
   </div>
  )
}
