require("dotenv").config() // loads variables from .env to process.env

const express = require("express")
const cors = require("cors") // cross-origin resoure sharing - allows frontend and backend on different ports/domains to communicate
const helmet = require("helmet")
const http = require("http")   
const { Server } = require("socket.io")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const menuRoutes = require("./routes/menuRoutes")
const errorHandler = require("./middleware/errorHandler")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const paymentRoutes = require("./routes/paymentRoutes");

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

// make io accessible in controllers via req.app.get("io")
app.set("io", io)

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`)
 
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

app.get("/", (req, res)=>{
    res.send("craveo API running")
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))