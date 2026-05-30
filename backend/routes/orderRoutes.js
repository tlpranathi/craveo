const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const { placeOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController")

// all order routes require login
router.use(protect)

router.post("/", placeOrder)                      // POST /api/orders
router.get("/my-orders", getMyOrders)             // GET  /api/orders/my-orders
router.patch("/:id/status", updateOrderStatus)    // PATCH /api/orders/:id/status

module.exports = router