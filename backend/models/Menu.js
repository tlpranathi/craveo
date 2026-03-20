const mongoose = require("mongoose")

const MenuSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    },
    name: String,
    price: Number,
    description: String,
    image: String
})

module.exports = mongoose.model("Menu", MenuSchema)
