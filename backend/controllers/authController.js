const User = require("../models/User")
const jwt = require("jsonwebtoken")
const sendResponse = require("../utils/response") // keep API responses clean
const AppError = require("../utils/AppError") // cleaner error handling
const { sendWelcomeEmail } = require("../src/services/email.service.js")

// generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, // payload - data stored inside token
        process.env.JWT_SECRET, // secret used to sign token, protects against fake tokens
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d"} // token expires in 7 days
    )}

// signup
const signup = async (req, res, next) => {
    try {
            const {name, email, password} = req.body
            
            // check for duplicate email
            const existingUser = await User.findOne({ email: email.toLowerCase() })
            if (existingUser) {
                throw new AppError("An account with this email already exists", 409)
            }

            // create user - password is hashed automatically by pre-save hook
            const user = await User.create({name, email, password})
            
            // send welcome email
            try { await sendWelcomeEmail(user.email, user.name); }
            catch (err) { console.error("Failed to send welcome email:", err) }

            // generate token immediately - user is logged in after signup
            const token = generateToken(user._id)

            return sendResponse(res, 201, true, "Account created successfully", {
                token, 
                user: {id: user._id, name: user.name, email: user.email, role: user.role}, 
            })
    } catch (error) {
        next (error)
    }
}


const login = async (req, res, next) => {
    try {
        const {email, password} = req.body

        // find email by user
        const user = await User.findOne({ email: email.toLowerCase() })
        
        // check user exists and password matches in 1 block - don't reveal which one failed
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError("Invalid email or password", 401)
        }

        // generate JWT
        const token = generateToken(user._id)

        return sendResponse(res, 200, true, "Login successful", {
            token,
            user: {
                id: user._id, name: user.name, email: user.email, role: user.role
            },
        })    
    } catch (error) {
            next(error)
    }
}

module.exports = { signup, login }
