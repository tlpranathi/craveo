// server/controllers/orderController.js

const Order = require("../models/Order")
const AppError = require("../utils/AppError")
const sendResponse = require("../utils/response")

const placeOrder = async (req, res, next) => {
  try {
    const { restaurantId, items } = req.body

    // 1. Validate input
    if (!restaurantId) {
      throw new AppError("Restaurant ID is required", 400)
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Order must contain at least one item", 400)
    }

    // 2. Calculate total on the backend — never trust frontend totals
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // 3. Build order
    const order = await Order.create({
      user: req.user._id,       // from protect middleware
      restaurant: restaurantId,
      items: items.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalPrice,
    })

    return sendResponse(res, 201, true, "Order placed successfully", { order })
  } catch (error) {
    next(error)
  }
}

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("restaurant", "name")   // pull in restaurant name only
      .sort({ createdAt: -1 })          // newest first

    return sendResponse(res, 200, true, "Orders fetched successfully", { orders })
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      throw new AppError("Invalid status value", 400)
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      throw new AppError("Order not found", 404)
    }

    // Only the user who placed it can cancel — others can't touch it
    if (
      status === "cancelled" &&
      order.user.toString() !== req.user._id.toString()
    ) {
      throw new AppError("Not authorized to cancel this order", 403)
    }

    order.status = status
    await order.save()

    return sendResponse(res, 200, true, "Order status updated", { order })
  } catch (error) {
    next(error)
  }
}

module.exports = { placeOrder, getMyOrders, updateOrderStatus }