const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const admin = require("../middleware/admin")
const { validate } = require("../middleware/validator")
const { getMenuValidator, createMenuValidator, updateMenuValidator } = require("../validators/menuValidator")
const { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } = require("../controllers/menuController")
/*
// test route
router.get("/test-admin", protect, admin, (req, res) => {
        res.json({ success: true, message: "Admin middleware works"})
    }
)
*/
router.post("/", protect, admin, createMenuValidator, validate, createMenuItem)
router.put("/:id", protect, admin, updateMenuValidator, validate, updateMenuItem)
router.delete("/:id", protect, admin, deleteMenuItem)
router.get("/:restaurantId", getMenuValidator, validate, getMenu)

module.exports = router

