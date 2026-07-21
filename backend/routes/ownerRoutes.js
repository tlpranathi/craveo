const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const owner = require("../middleware/owner");
const { getRestaurantOrders } = require("../controllers/orderController");

router.use(protect);
router.use(owner);

router.get("/orders", getRestaurantOrders);
router.get("/stats", protect, owner, getStats);

module.exports = router;