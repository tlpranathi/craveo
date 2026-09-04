require("dotenv").config()

const http = require("http")
const jwt = require("jsonwebtoken")
const { Server } = require("socket.io")

const User = require("./models/User")
const Restaurant = require("./models/Restaurant")
const connectDB = require("./config/db")
const app = require("./app")

const httpServer = http.createServer(app)

const allowedOrigins = [
  "http://localhost:5173",
  "https://craveoo.vercel.app",
  "https://craveo-eight.vercel.app",
]

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
})

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

app.set("io", io)

io.on("connection", async (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  if (socket.user?.role === "superadmin") {
    socket.join("adminRoom")
    console.log(`Socket ${socket.id} joined adminRoom`)
  } else if (socket.user?.role === "owner") {
    try {
      const restaurant = await Restaurant.findOne({
        owner: socket.user._id,
      })

      if (restaurant) {
        socket.join(`restaurant_${restaurant._id}`)
        console.log(
          `Socket ${socket.id} joined restaurant_${restaurant._id}`
        )
      }
    } catch (err) {
      console.error("Failed to join owner room:", err)
    }
  }

  socket.on("joinOrderRoom", (orderId) => {
    socket.join(`order_${orderId}`)
    console.log(`Socket ${socket.id} joined room: order_${orderId}`)
  })

  socket.on("leaveOrderRoom", (orderId) => {
    socket.leave(`order_${orderId}`)
    console.log(`Socket ${socket.id} left room: order_${orderId}`)
  })

  socket.on("joinRestaurantRoom", (restaurantId) => {
    socket.join(`restaurantPublic_${restaurantId}`)
    console.log(
      `Socket ${socket.id} joined room: restaurantPublic_${restaurantId}`
    )
  })

  socket.on("leaveRestaurantRoom", (restaurantId) => {
    socket.leave(`restaurantPublic_${restaurantId}`)
    console.log(
      `Socket ${socket.id} left room: restaurantPublic_${restaurantId}`
    )
  })

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

connectDB()

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})