const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment, markPaymentFailed } = require("../controllers/paymentController");
const protect = require("../middleware/protect");

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

module.exports = router;