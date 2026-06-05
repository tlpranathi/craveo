const User = require("../models/User")
const sendResponse = require("../utils/response") 
const AppError = require("../utils/AppError")

// GET /api/users/profile
const getProfile = async(req, res, next) => {
    try{ 
        return sendResponse(res, 200, true, "Profile fetched successfully", {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        })
    } catch (error) {
        next(error)
    }
}

// PUT /api/users/profile
const updateProfile = async(req, res, next) => {
    try {
        const {name, email} = req.body

        const user = await User.findById(req.user._id)
        if(!user) throw new AppError("User not found", 404)

        user.name = name || user.name
        user.email = email || user.email

        await user.save()
      
        return sendResponse(res, 200, true, "Profile updated successfully", {
            id: user._id, 
            name: user.name,
            email: user.email,
            role: user.role,
        })
    } catch (error) {
        next(error)
    }
}

// PUT /api/users/change-password
const changePassword = async(req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body
    // mongodb query
    const user = await User.findById(req.user._id)
    
    if(!user) throw new AppError("user not found", 404)

    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) throw new AppError("Current password is incorrect", 401)
    
    if (currentPassword === newPassword) throw new AppError("New password must be different form current password", 400)

    user.password = newPassword

    await user.save()
    return sendResponse(res, 200, true, "Password updated successfully")
    } catch (error) {
        next(error)
    }
}

module.exports = {getProfile, updateProfile, changePassword}