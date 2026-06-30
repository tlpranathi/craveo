const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { placeOrder, getMyOrders, updateOrderStatus, getAllOrders } = require("../controllers/orderController")

router.use(protect)

router.get("/", admin, getAllOrders)              
router.get("/my-orders", getMyOrders)
router.post("/", placeOrder)
router.patch("/:id/status", updateOrderStatus)

module.exports = router
