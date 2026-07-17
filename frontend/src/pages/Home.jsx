import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import API from "../services/api"
import VerticalCarousel from "../components/VerticalCarousel"
import HorizontalCarousel from "../components/HorizontalCarousel";
import { MapPinCheckInside, Utensils, ShoppingCart, Bike, Computer } from "lucide-react";


const foodImages = [
  "/food/burger.jpg",
  "/food/dosa.jpg",
  "/food/pizza.jpg",
  "/food/ramen.jpg",
  "/food/cheesecake.jpg",
  "/food/biriyani.jpg",
  "/food/fries.jpg",
  "/food/sambhar.jpg",
  "/food/sushi.jpg",
  "/food/chicken-skewers.jpg",
    "/food/coffee.jpg",
]

const Home = () => {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await API.get("/restaurants")
        // top 4 by rating for featured
        const sorted = [...res.data.data.restaurants].sort((a, b) => b.rating - a.rating).slice(0, 4)
        setFeatured(sorted)
      } catch (err) {
        // fail silently — home page shouldn't break if this fails
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      {/* hero section */}
      <div className="relative w-full overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 py-28 sm:py-40 md:py-52 lg:py-60 min-h-[500px] sm:min-h-[600px] flex">
          
          <div className="relative z-10 flex w-full h-full">

            {/* left half — wide scrolling carousel */}
            <div className="hidden md:flex w-1/2 h-full">
              <VerticalCarousel images={foodImages} />
            </div>

            {/* right half — all text, right-aligned */}
            <div className="w-full md:w-1/2 px-10 lg:px-16 flex items-center justify-center">
            <div className="relative max-w-xl flex flex-col items-center text-center">
              <span className="absolute inset-0 flex items-center justify-center text-[10rem] lg:text-[11rem] tracking-[0.1em] font-black text-white/7 pointer-events-none">
                CRAVEO
              </span>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Discover Bengaluru,
              </h1>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                One bite at a time.
              </h1>
              <p className="mt-6 text-lg text-orange-100">
                From crispy dosas to late-night shawarmas, discover Bengaluru's best food.
              </p>
              <button
                onClick={() => navigate("/restaurants")}
                className="mt-10 bg-white text-orange-600 px-8 py-3.5 rounded-full font-semibold hover:bg-orange-50 transition">
                Start Exploring
              </button>
            </div>
          </div>
          </div>
        </div>
        {/* mobile carousel */}
        <div className="md:hidden px-4"> <HorizontalCarousel images={foodImages} /> </div>
    </div>
    
      <br></br>
      <br></br>

      {/* how it works */}
      <div className="max-w-6xl mx-auto px-4 py-16 relative">
        <h2 className="text-4xl font-bold text-black text-center mb-10">
          How Craveo works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center bg-white rounded-2xl shadow-sm hover:shadow-lg p-8">
            <div className="w-14 h-14 bg-craveo-100 text-craveo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <Utensils className="w-7 h-7 text-craveo-600 hover:-translate-y-2 hover:shadow-xl transition-all duration-300" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Browse restaurants
            </h3>
            <p className="text-gray-500 text-sm">
              Explore restaurants by cuisine, rating, or location.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl shadow-sm hover:shadow-lg p-8">
            <div className="w-14 h-14 bg-craveo-100 text-craveo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 ">
              <ShoppingCart className="w-7 h-7 text-craveo-600 hover:-translate-y-2 hover:shadow-xl transition-all duration-300" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Add to cart
            </h3>
            <p className="text-gray-500 text-sm">
              Add your favorite dishes to the cart and place your order in just a few clicks.
            </p>
          </div>
          <div className="text-center bg-white rounded-2xl shadow-sm hover:shadow-lg p-8">
            <div className="w-14 h-14 bg-craveo-100 text-craveo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              <Bike className="w-7 h-7 text-craveo-600 hover:-translate-y-2 hover:shadow-xl transition-all duration-300" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Track your order
            </h3>
            <p className="text-gray-500 text-sm">
              Track your order from confirmation to delivery with live status updates.
            </p>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>

      {/* featured restaurants */}
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Top rated near you</h2>
            <button onClick={() => navigate("/restaurants")} className="text-white font-medium text-sm hover:underline whitespace-nowrap">
              View all →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((r) => (
                <div key={r._id} onClick={() => navigate(`/menu/${r._id}`)} className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group">
                  <div className="h-32 bg-craveo-50 overflow-hidden relative">
                    {r.image ? ( <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.style.display = "none" }}/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-craveo-300 text-3xl">
                        <Utensils></Utensils>
                      </div>
                    )}
                    {r.rating && (
                      <span className="absolute top-2 right-2 bg-white/95 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                        ⭐ {r.rating}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-craveo-600 transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">{r.cuisine}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        {/* footer */}
      <footer className="bg-gray-950 text-gray-300 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-3">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* Brand */}
      <div>
        <h2 className="text-2xl font-bold text-white">Craveo</h2>
        <p className="mt-3 text-sm text-gray-400">
          Discover Bengaluru, one bite at a time.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-white mb-4">
          Quick Links
        </h3>

        <ul className="space-y-2 text-sm">
          <li><a href="/restaurants" className="hover:text-white">Restaurants</a></li>
          <li><a href="/login" className="hover:text-white">Login</a></li>
          <li><a href="/register" className="hover:text-white">Signup</a></li>
        </ul>
      </div>

     {/* Contact */}
    <div>
    <h3 className="font-semibold text-white mb-4">Connect</h3>
    <div className="space-y-3">
    <a href="https://github.com/tlpranathi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
      <Computer className="w-5 h-5" />
      GitHub
    </a>
    <a href="https://www.linkedin.com/in/pranathi-tummalapenta-900a6131a/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
      <Computer className="w-5 h-5" />
      LinkedIn
    </a>
  </div>
</div>
</div>

    <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} Craveo. Built with ❤️ using MERN.
    </div>

  </div>
  
</footer>
</div>

  );
};

export default Home;