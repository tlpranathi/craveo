require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")

const authRoutes = require("./routes/authRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const menuRoutes = require("./routes/menuRoutes")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const ownerRoutes = require("./routes/ownerRoutes")
const adminRoutes = require("./routes/adminRoutes")
const errorHandler = require("./middleware/errorHandler")

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://craveoo.vercel.app",
  "https://craveo-eight.vercel.app",
]

app.use(helmet())
app.use(express.json())

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, tests, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
  })
)

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) =>
      res.set("Cross-Origin-Resource-Policy", "cross-origin"),
  })
)

// routes
app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/owner", ownerRoutes)
app.use("/api/admin", adminRoutes)

app.get("/", (req, res) => {
  res.send("craveo API running")
})

app.use(errorHandler)

module.exports = app