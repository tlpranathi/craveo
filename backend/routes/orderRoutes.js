const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const { placeOrder, getMyOrders, updateOrderStatus } = require("../controllers/orderController")
const { placeOrderValidator, updateOrderStatusValidator } = require("../validators/orderValidator")
const { validate } = require("../middleware/validator")

// all order routes require login
router.use(protect)

router.post("/", placeOrderValidator, validate, placeOrder) // POST /api/orders
router.get("/my-orders", getMyOrders) // GET  /api/orders/my-orders
router.patch("/:id/status", updateOrderStatusValidator, validate, updateOrderStatus) // PATCH /api/orders/:id/status

module.exports = router