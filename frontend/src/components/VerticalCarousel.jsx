export default function VerticalCarousel({ images, reverse = false }) {
  // duplicate images so scrolling looks continuous
  const allImages = [...images, ...images]

  return (
    <div className="overflow-hidden h-[650px] w-44">
      <div
        className={`flex flex-col gap-4 ${
          reverse ? "animate-scrollDown" : "animate-scrollUp"
        }`}
      >
        {allImages.map((img, index) => (
          <img key={index} src={img} alt="" className="rounded-2xl shadow-lg object-cover h-40 w-full"/>
        ))}
      </div>
    </div>
  )
}