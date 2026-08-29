const razorpay = require("../config/razorpay")
const sendResponse = require("../utils/response");
const Menu = require("../models/Menu")
const Order = require("../models/Order")
const crypto = require("crypto");

const createOrder = async(req, res, next) => {
    try {
        const { restaurant: restaurantId, items } = req.body;

        // validate request
        if (!restaurantId || !items || items.length === 0) {
            return sendResponse(res, 400, false, "Restaurant and items are required");
        }

        // fetch menu items from db
        const menuItems = await Menu.find({
            _id: { $in: items.map(item => item.menuItemId) }
        });

        // calculate total price securely
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {

            const menu = menuItems.find(
                menu => menu._id.toString() === item.menuItemId
            );

            if (!menu) {
                return sendResponse(res, 404, false, "Menu item not found");
            }

            // ensure menu item belongs to selected restaurant
            if (menu.restaurantId.toString() !== restaurantId) {
                return sendResponse(
                    res,
                    400,
                    false,
                    "Menu item does not belong to the selected restaurant"
                );
            }

            totalPrice += menu.price * item.quantity;

            // save snapshot of menu item in order
            orderItems.push({
                menuItemId: menu._id,
                name: menu.name,
                price: menu.price,
                quantity: item.quantity
            });
        }

        // create pending order
        const order = await Order.create({
            user: req.user.id,
            restaurant: restaurantId,
            items: orderItems,
            totalPrice,
            status: "pending",
            payment: {
                status: "Pending"
            }
        });

        // create razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: totalPrice * 100,
            currency: "INR",
            receipt: `order_${order._id}`
        });

        // save razorpay order id
        order.payment.razorpayOrderId = razorpayOrder.id;

        await order.save();

        return sendResponse(res, 200, true, "Order created successfully", {
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch(err) {
        next(err);
    }
};


const verifyPayment = async (req, res, next) => {
    try {

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // generate signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        // compare signatures
        if (generatedSignature !== razorpay_signature) {
            // mark both payment AND order failed/cancelled - otherwise the order sits as "pending" forever, showing up as an active order everyone can see
            await Order.findByIdAndUpdate(orderId, {
                "payment.status": "Failed",
                status: "cancelled"
            });
            return sendResponse(res,400, false, "Payment verification failed");
        }

        // payment verified
        const order = await Order.findById(orderId).populate("user", "email name").populate("restaurant", "name");
        if (!order) { return sendResponse( res, 404, false, "Order not found"); }
        order.payment.status = "Successful";
        order.payment.razorpayPaymentId = razorpay_payment_id;
        order.payment.razorpaySignature = razorpay_signature;
        order.payment.paidAt = new Date() // cancel window starts from here
        await order.save();

        // notify owner + admin dashboards instantly - this is the point an order actually becomes real (paid)
        const io = req.app.get("io")
        if (io) {
            io.to(`restaurant_${order.restaurant._id}`).emit("newOrder", { order })
            io.to("adminRoom").emit("newOrder", { order })
        }
        return sendResponse(res, 200, true, "Payment verified successfully", order);
    } catch (err) {
        next(err);
    }
};

// mark a payment as failed - called when Razorpay's own "payment.failed" event fires (card declined, insufficient funds, etc.) or when the user closes the checkout without completing payment. Without this, the order sits as "pending" forever - it never reaches verifyPayment at all since Razorpay never calls our handler.
const markPaymentFailed = async (req, res, next) => {
    try {
        const { orderId, reason } = req.body;

        if (!orderId) { return sendResponse(res, 400, false, "orderId is required");}

        const order = await Order.findById(orderId);
        if (!order) { return sendResponse(res, 404, false, "Order not found"); }

        // only the order's own user can mark it failed, and only while it's still pending -
        // don't let this clobber an order that already succeeded or was already cancelled
        if (order.user.toString() !== req.user._id.toString()) {
            return sendResponse(res, 403, false, "Not authorized");
        }
        if (order.payment.status !== "Pending") {
            return sendResponse(res, 200, true, "Order already resolved", order);
        }

        order.payment.status = "Failed";
        order.status = "cancelled";
        await order.save();

        return sendResponse(res, 200, true, "Payment marked as failed", order);
    } catch (err) {
        next(err);
    }
};

module.exports = { createOrder, verifyPayment, markPaymentFailed };