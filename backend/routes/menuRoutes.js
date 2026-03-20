const express = require("express")
const router = express.Router()

const Menu = require("../models/Menu")

router.get("/:restuarantId", async (req, res) => {
    try {
        const items = await Menu.find({
            restaurantId: req.params.restaurantId
        })

        res.json(items)

    } catch (error) {
        res.status(500).json({
            messgae: "server error"
        })
    }
})

module.exports = router