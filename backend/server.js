require("dotenv").config() // loads variables from .env to process.env

const express = require("express")
const cors = require("cors") // cross-origin resoure sharing - allows frontend and backend on different ports/domains to communicate
const helmet = require("helmet")
const http = require("http")   
const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")
const User = require("./models/User")
const Restaurant = require("./models/Restaurant")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const menuRoutes = require("./routes/menuRoutes")
const errorHandler = require("./middleware/errorHandler")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const paymentRoutes = require("./routes/paymentRoutes");
const ownerRoutes = require("./routes/ownerRoutes")
const adminRoutes = require("./routes/adminRoutes")

const app = express()
const httpServer = http.createServer(app) // wrap app in http server

const allowedOrigins = [
  "http://localhost:5173",
  "https://craveoo.vercel.app",
  "https://craveo-eight.vercel.app",
  
];

// socket io setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
})

// authenticate the socket itself with the same JWT used for HTTP requests - this lets us auto-join role-based rooms below without the frontend needing to know its own restaurant id or manually request access to admin data
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next()
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    if (user) socket.user = user
    next()
  } catch (err) {
    next()
  }
})


// make io accessible in controllers via req.app.get("io")
app.set("io", io)

io.on("connection", async (socket) => {
   console.log(`Socket connected: ${socket.id}`)

  // auto-join role-based rooms so owner/admin dashboards get live updates
  if (socket.user?.role === "superadmin") {
    socket.join("adminRoom")
    console.log(`Socket ${socket.id} joined adminRoom`)
  } else if (socket.user?.role === "owner") {
    try {
      const restaurant = await Restaurant.findOne({ owner: socket.user._id })
      if (restaurant) {
        socket.join(`restaurant_${restaurant._id}`)
        console.log(`Socket ${socket.id} joined restaurant_${restaurant._id}`)
      }
    } catch (err) {
      console.error("Failed to join owner room:", err)
    }
  }
  // client joins their order's room
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`)
    console.log(`Socket ${socket.id} joined room: order_${orderId}`)
  })

  // client leaves room when unmounting
  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(`order_${orderId}`)
    console.log(`Socket ${socket.id} left room: order_${orderId}`)
  })

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})


// middleware
connectDB()

app.use(helmet())
app.use(express.json())

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/payment", paymentRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes)

app.get("/", (req, res)=>{
    res.send("craveo API running")
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))