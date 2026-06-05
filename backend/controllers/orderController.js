const Order = require("../models/Order")
const AppError = require("../utils/AppError")
const sendResponse = require("../utils/response")

// place order
// create a new order for a logged-in user
const placeOrder = async (req, res, next) => {
    try {
        const { restaurantId, items } = req.body // extract restaurantId and cart items from request body

        // calculate total order price
        const totalPrice = items.reduce(
          (sum, item) => sum + item.price * item.quantity, 0
        )

        // build order
        // create order document
        const order = await Order.create({
          user: req.user._id, // logged-in user id from auth middleware
          restaurant: restaurantId,
          items: items.map((item) => ({ // transform frontened cart items into order schema format
            menuItemId: item._id, // reference to original menu item
            // snapshot of item details 
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice // final calculated total
        })
        return sendResponse(res, 201, true, "Order placed successfully", { order }) 
    } catch (error) {
      next(error)
    }
}

// get logged-in user orders
const getMyOrders = async(req, res, next) => {
    try {
        // fetch orders belonging to user
        const orders = await Order.find({ user: req.user._id })
          // replace restaurantId with name and only fetch restaurant name field
          .populate("restaurant", "name")
          // sort newest orders first
          .sort({ createdAt: -1 })
        return sendResponse(res, 200, true, "Orders fetched successfully", { orders })
    } catch (error) {
      next(error)
    }
}

// update order status
// used for - confirmed, prepared, delivered, cancelled

const updateOrderStatus = async (req, res, next) => {
    try {
        // extract new status from request body
        const { status } = req.body

        // find order by ID
        const order = await Order.findById(req.params.id)

        if(!order) {
          throw new AppError("order not found", 404)
        }

        // only user who placed order can cancel it
        // prevents other users from modifying orders
        if (status === "cancelled") {
          const timeDiff = Date.now() - order.createdAt.getTime()
          const oneMin = 60*1000
          if (timeDiff > oneMin) {
            throw new AppError("Orders can only be cancelled within 1 minute of placing the order", 400)
          }
          if (order.user.toString() !== req.user._id.toString()) {
            throw new AppError("Not authorized to cancel this order", 403)
          }
        } 
        else {
          // only admin can update other statuses
          if (req.user.role != "admin") {
            throw new AppError("only admins can update order status", 403)
          }
        }

        order.status = status
        await order.save()

        return sendResponse(res, 200, true, "Order status updated", { order })
    } catch (error) {
      next(error)
    }
}

module.exports = { placeOrder, getMyOrders, updateOrderStatus }
