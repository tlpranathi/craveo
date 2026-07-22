const express = require("express");
const router = express.Router();
const protect = require("../middleware/protect");
const owner = require("../middleware/owner");
const { getRestaurantOrders, getStats } = require("../controllers/orderController");
const { getRestaurantMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menuController");
const { getAllReviews } = require("../controllers/reviewController");

router.use(protect);
router.use(owner);

router.get("/orders", getRestaurantOrders);

router.get("/menu", getRestaurantMenu);
router.post("/menu", createMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

router.get("/reviews", getAllReviews);

router.get("/stats", getStats);

module.exports = router;