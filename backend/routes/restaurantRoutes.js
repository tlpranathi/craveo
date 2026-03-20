const express = require("express")
const router = express.Router()

const Restaurant = require("../models/Restaurant")

router.get("/", async (req, res) => {
    try {
        const restaurants = await Restaurant.find()

        res.json(restaurants)
    } catch (error) {
        res.status(500).json({
            message: "server error"
        })
    }
})

module.exports = router


