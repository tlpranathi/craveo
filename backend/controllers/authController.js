const User = require("../models/User")
const jwt = require("jsonwebtoken")
const sendResponse = require("../utils/response") // keep API responses clean
const AppError = require("../utils/AppError") // cleaner error handling
const { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail } = require("../src/services/email.service.js")
const crypto = require("crypto")
const RESET_TOKEN_EXPIRY_MS = 15*60*1000 // 15 minutes

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
// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email.toLowerCase() })
        const genericMessage = "If an account with that email exists, a password reset link has been sent."

        if (!user) {
            return sendResponse(res, 200, true, genericMessage)
        }

        const rawToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRY_MS
        await user.save({ validateBeforeSave: false })

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
        const resetLink = `${frontendUrl}/reset-password/${rawToken}`

       try {
            await sendPasswordResetEmail(user.email, user.name, resetLink)
        } catch (err) {
            console.error("Failed to send password reset email:", err)
        }

        return sendResponse(res, 200, true, genericMessage)
    } catch (error) {
        next(error)
   }
}

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params
        const { password } = req.body
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        }).select("+resetPasswordToken +resetPasswordExpires")

        if (!user) {
            throw new AppError("Invalid or expired password reset link", 400)
        }

        user.password = password
        user.resetPasswordToken = undefined
       user.resetPasswordExpires = undefined
        await user.save()

        try {
            await sendPasswordChangedEmail(user.email, user.name)
        } catch (err) {
            console.error("Failed to send password changed email:", err)
        }

        return sendResponse(res, 200, true, "Password reset successfully. You can now log in with your new password.")
    } catch (error) {
        next(error)
    }
}

module.exports = { signup, login, forgotPassword, resetPassword }
