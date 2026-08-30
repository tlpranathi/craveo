const User = require("../models/User")
const Order = require("../models/Order")
const Review = require("../models/Review")
const sendResponse = require("../utils/response") 
const AppError = require("../utils/AppError")
//const { sendPasswordResetEmail } = require("../src/services/email.service.js")
const { sendPasswordChangedEmail } = require("../src/services/email.service.js")


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

// GET /api/users/profile/stats
// powers the "profile statistics" cards - total orders placed, total money
// actually spent, and how many reviews the user has written
const getProfileStats = async (req, res, next) => {
    try {
        const userId = req.user._id

        const totalOrders = await Order.countDocuments({ user: userId })

        // "money spent" reflects orders that were actually paid for, not just
        // placed - a pending/failed-payment order hasn't cost the user anything
        const spentResult = await Order.aggregate([
            { $match: { user: userId, "payment.status": "Successful" } },
            { $group: { _id: null, totalSpent: { $sum: "$totalPrice" } } }
        ])
        const totalSpent = spentResult.length > 0 ? spentResult[0].totalSpent : 0

        const reviewsCount = await Review.countDocuments({ user: userId })

        return sendResponse(res, 200, true, "Profile statistics fetched successfully", {
            totalOrders,
            totalSpent,
            reviewsCount,
        })
    } catch (error) {
        next(error)
    }
}

// GET /api/users/... admin only: list users with role "owner", for assigning restaurant ownership in the admin panel
const getOwners = async (req, res, next) => {
    try {
        const owners = await User.find({ role: "owner" }).select("name email")
       return sendResponse(res, 200, true, "Owners fetched successfully", { owners })
    } catch (error) {
        next(error)
    }
}

// PUT /api/users/profile
const updateProfile = async(req, res, next) => {
    try {
        const {name} = req.body

        const user = await User.findById(req.user._id)
        if(!user) throw new AppError("User not found", 404)

        user.name = name || user.name

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
    try {
        await sendPasswordChangedEmail(user.email, user.name);
    } catch (err) {
        console.error(err);
    }

    return sendResponse(res, 200, true, "Password updated successfully")
    } catch (error) {
        next(error)
    }
}

module.exports = {getProfile, updateProfile, changePassword, getOwners, getProfileStats}