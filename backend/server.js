require("dotenv").config()

const express = require("express")
const cors = require("cors")

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const restaurantRoutes = require("./routes/restaurantRoutes")
const menuRoutes = require("./routes/menuRoutes")
const errorHandler = require("./middleware/errorHandler")
const orderRoutes = require("./routes/orderRoutes")


const app = express()

connectDB()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/orders", orderRoutes)
app.use(errorHandler)


app.get("/", (req, res)=>{
    res.send("feedMe API running")
})

app.listen(5000, ()=>{
    console.log("server running on port 5000")
})

