import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext" 
import { useCart } from "../context/CartContext"
import { useState } from "react"

export default function Navbar() {
  const { user, logout } = useAuth() // gets authentication information from AuthContext
  const { totalItems } = useCart() // gets cart data for cart badge
  const navigate = useNavigate() // lets you direct programatically, used during logout
  const [menuOpen, setMenuOpen] = useState(false) // used for mobile menu

  const handleLogout = () => {
    logout() // removes craveo_user and craveo_token from localStorage
    navigate("/login") // redirects user
    setMenuOpen(false) // closes mobile menu if open
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50"> {/* main navbar container */}
      {/* white background, small shadow, navbar stays at top while scrolling, keeps navbar above other content */}
      <div className="max-w-8xl mx-auto px-4 flex items-center justify-between h-16"> {/* inner wrapper */}
        {/* limits width, centers navbar, horizontal padding, makes children sit in 1 row, pushes logo and links apart, navbar height */}
        {/* logo */}
        <Link to="/" className="text-4xl font-bold text-craveo-600"> {/* large text, bold, custom tailwind colour */}
          Craveo
        </Link> {/*link used to navigate without refreshing the page*/}

        {/* desktop menu */}
        <div className="hidden md:flex items-center gap-6"> {/* hidden on small screens and flex on medium and above */}
          <Link to="/restaurants" className="text-gray-700 hover:text-craveo-600 font-medium transition duration-200">
            Restaurants
          </Link> {/* alwyas visible whether logged in or not */}

          {/* if user exists show orders, cart, profile, logout*/}
          {user ? (
            <>
              <Link to="/orders" className="text-gray-700 hover:text-craveo-600 font-medium transition duration-200">
                Orders
              </Link>
              {user.role === "admin" && (
                <Link to="/admin/restaurants" className="text-gray-700 hover:text-craveo-600 font-medium transition">
                Admin
                </Link>
              )}

              {/* cart with badge */}
              <Link to="/cart" className="relative text-gray-700 hover:text-craveo-600 font-medium transition duration-200">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-craveo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}  {/* positioned relative to cart */}
              </Link>
              {/* relative               -> parent reference for absolute badge
                    absolute               -> position badge freely
                    -top-2 -right-3        -> move badge above top-right corner
                    rounded-full           -> perfect circle
                    w-5 h-5                -> badge size
                    flex items-center justify-center -> center badge number */}

              <Link to="/profile" className="text-gray-700 hover:text-craveo-600 font-medium transition duration-200">
                <span className="text-black-500">
                  Hi, <span className="font-semibold">{user.name.split(" ")[0]}</span>
                </span>              
              </Link>
                {/* logout */}
              <button
                onClick={handleLogout}
                className="bg-craveo-500 hover:bg-craveo-600 text-white px-4 py-2 rounded-lg font-medium transition">
                Logout
              </button>
            </>
          ) : (         /* guest menu */
            <>
              <Link to="/login" className="text-gray-700 hover:text-craveo-600 font-medium transition duration-200">
                Login
              </Link>
              <Link to="/register"
                className="bg-craveo-500 hover:bg-craveo-600 text-white px-4 py-2 rounded-lg font-medium transition duration-200">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* mobile hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)} /* toggles false->true, true->false */
          aria-label="Toggle menu"
        >
           {/* SVG = Scalable Vector Graphic (drawn using lines instead of images) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* mobile dropdown menu */}
      {/* render mobile menu only if menuOpen == true */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 flex flex-col gap-3">
          <Link to="/restaurants" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
            Restaurants
          </Link>

          {user ? (
            <>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                Orders
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                Cart {totalItems > 0 && `(${totalItems})`}
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                Profile
              </Link>
              <button onClick={handleLogout} className="bg-craveo-500 text-white px-4 py-2 rounded-lg font-medium text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-craveo-500 text-white px-4 py-2 rounded-lg font-medium text-center">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}