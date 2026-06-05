require("dotenv").config() // loads variables from .env to process.env

const express = require("express")
const cors = require("cors") // cross-origin resoure sharing - allows frontend and backend on different ports/domains to communicate
const helmet = require("helmet")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const menuRoutes = require("./routes/menuRoutes")
const errorHandler = require("./middleware/errorHandler")
const orderRoutes = require("./routes/orderRoutes")
const userRoutes = require("./routes/userRoutes")


const app = express()

connectDB()

app.use(helmet())
app.use(express.json())
app.use(cors())

app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use(errorHandler)


app.get("/", (req, res)=>{
    res.send("craveo API running")
})

app.listen(5000, ()=>{
    console.log("server running on port 5000")
})