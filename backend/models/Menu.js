const mongoose = require("mongoose") // mongoose helps Node.js interact with MongoDB using schemas and models

// create schema for Menu collection
const MenuSchema = new mongoose.Schema({
    
    // reference to the restaurant this menu item belongs to
    // ObjectId stores teh _id of a restuarant document
    // ref allows us to use populate() later 
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: "true"
    },
    name: {
        type: String, 
        required: true
    },
    price: {
        type: Number, 
        required: true
    },
    description: String,
    image: String
})

// create and export Menu model
// "Menu" => mongoose automatically converts this to "menus" collection in MongoDB
// Model is used for CRUD operations: create(), find(), findById(), updateOne(), deleteOne()
module.exports = mongoose.model("Menu", MenuSchema)
