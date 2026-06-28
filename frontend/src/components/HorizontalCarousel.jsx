export default function HorizontalCarousel({ images }) {
  const allImages = [...images, ...images];

  return (
    <div className="overflow-hidden w-full py-6">
      <div className="flex gap-4 animate-scrollLeft w-max">
        {allImages.map((img, index) => (
          <img key={index} src={img} alt="" className="h-36 w-44 rounded-2xl object-cover shadow-lg flex-shrink-0"/>
        ))}
      </div>
    </div>
  );
}