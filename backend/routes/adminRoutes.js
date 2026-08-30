const express = require("express")
const router = express.Router()
const { getMenu } = require("../controllers/menuController")
const { getRestaurants } = require("../controllers/restaurantController")
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { getStats } = require("../controllers/orderController") 
const { getOwners } = require("../controllers/userController")

/*
// test route
router.get("/test-admin", protect, admin, (req, res) => {
        res.json({ success: true, message: "Admin middleware works"})
    }
)
*/

router.get("/", getRestaurants)
router.get("/stats", protect, admin, getStats);
router.get("/owners", protect, admin, getOwners); // must come before /:restaurantId, or it gets swallowed by that param route
router.get("/:restaurantId", getMenu)

module.exports = router

