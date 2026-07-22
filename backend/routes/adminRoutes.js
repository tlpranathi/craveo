const express = require("express")
const router = express.Router()
const { getMenu } = require("../controllers/menuController")
const { getRestaurants } = require("../controllers/restaurantController")
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { getStats } = require("../controllers/orderController") 

/*
// test route
router.get("/test-admin", protect, admin, (req, res) => {
        res.json({ success: true, message: "Admin middleware works"})
    }
)
*/

router.get("/", getRestaurants)
router.get("/stats", protect, admin, getStats);
router.get("/:restaurantId", getMenu)

module.exports = router

