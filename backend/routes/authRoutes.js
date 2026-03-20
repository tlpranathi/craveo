const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")

const User = require("../models/User")

router.post("/signup", async (req, res) => {
    try {
        const {name, email, password} = req.body

        const hashedPassword = await bcrypt.hash(password, 10)

        const user =  new User({
            name,
            email, 
            password: hashedPassword
        })
        
        await user.save()

        res.status(201).json({
            message: "user created successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "server error"
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await User.findOne({email})

        if (!user) {
            return res.status(404).json({
                message: "user not found"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                message: "invalid password"
            })
        }

        res.status(200).json({
            message: "login successful", 
            user
        })
    } catch (error) {
        res.status(500).json({
            message: "server error"
        })
    }
})


module.exports = router