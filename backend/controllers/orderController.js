const Order = require("../models/Order")
const AppError = require("../utils/AppError")
const sendResponse = require("../utils/response")
const { sendOrderDeliveredEmail } = require("../src/services/email.service")
const Review = require("../models/Review")
const Restaurant = require("../models/Restaurant");

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
        // pagination query params
        const { page = 1, limit = 10 } = req.query
        // valid positive numbers
        const pageNumber = Math.max(1, Number(page))
        const limitNumber = Math.max(1, Number(limit))
        // number of documents to skip
        const skip = (pageNumber-1)*limitNumber
        // count total orders belonging to logged-in user
        const totalOrders = await Order.countDocuments({user: req.user._id})
        // calculate total pages
        const totalPages = Math.max(0, Math.ceil(totalOrders / limitNumber))

        // fetch orders belonging to user
        const orders = await Order.find({ user: req.user._id })
        .populate("restaurant", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);

        // find which of these orders have already been reviewed
        const reviews = await Review.find({
          order: { $in: orders.map((order) => order._id) },
        }).select("order");

        const reviewedOrders = new Set(
          reviews.map((review) => review.order.toString())
        );

        // attach review status to each order
        const ordersWithReviewStatus = orders.map((order) => ({
          ...order.toObject(),
          hasReview: reviewedOrders.has(order._id.toString()),
        }));

        return sendResponse(res, 200, true, "Orders fetched successfully",
          {
            orders: ordersWithReviewStatus,
            page: pageNumber,
            limit: limitNumber,
            totalOrders,
            totalPages,
          }
        );
      } catch(error) {
          next(error);
        }
}


// update order status
// used for - confirmed, prepared, delivered, cancelled

const updateOrderStatus = async (req, res, next) => {
    try {
        // extract new status from request body
        const { status } = req.body

        // find order by ID
        const order = await Order.findById(req.params.id).populate("user", "name email").populate("restaurant", "name")

        if(!order) {
          throw new AppError("order not found", 404)
        }
        
        // only user who placed order can cancel it
        // prevents other users from modifying orders
        // user can only cancel their own pending order within 1 minute
        if (status === "cancelled") {
          if (order.user._id.toString() !== req.user._id.toString()) {
            throw new AppError("Not authorized to cancel this order.", 403);
          }

          if (order.status.toLowerCase() !== "pending") {
            throw new AppError("Only pending orders can be cancelled.", 400);
          }

          const oneMinute = 60 * 1000;
          const timeDiff = Date.now() - order.createdAt.getTime();

          if (timeDiff > oneMinute) {
            throw new AppError("Orders can only be cancelled within 1 minute of placing them.", 400);
          }
        } else {
          // only admins can update other statuses
          if (req.user.role === "owner") {
            const restaurant = await Restaurant.findOne({
                owner: req.user._id,
            });
            if (!restaurant) { throw new AppError("Restaurant not found", 404); }
            if (order.restaurant._id.toString() !== restaurant._id.toString()) {
                throw new AppError("Unauthorized", 403);
            }
        }
        }

        order.status = status
        await order.save()

        // emit real time updates to order room
        const io = req.app.get("io")
        if (io) {
          console.log(`Emitting to room: order_${order._id}`)
          io.to(`order_${order._id}`).emit("orderStatusUpdated", {
            orderId: order._id,
            status: order.status,
          })
        }

        if (order.status == "delivered") {
       try {
        console.log("About to send order delivered email to:", order.user.email);

        await sendOrderDeliveredEmail(
          order.user.email,
          order.user.name,
          order.items,
          order.restaurant.name,
          `${process.env.FRONTEND_URL}/orders`
        );

        console.log("Order delivered email sent successfully.");
      } catch (err) {
        console.error("Failed to send order delivered email:", err);
      }}
    

    return sendResponse(res, 200, true, "Order status updated", { order })
    } catch (error) {
  next(error);
}
    
}


const getAllOrders = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })

    return sendResponse(res, 200, true, "All orders fetched", { orders, totalOrders })
  } catch (error) {
    next(error)
  }
}

const getRestaurantOrders = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findOne({
            owner: req.user._id
        });

        if (!restaurant) {
            return next(new AppError("Restaurant not found", 404));
        }

        const orders = await Order.find({
            restaurant: restaurant._id
        })
        .populate("user", "name email")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

        return sendResponse(res, 200, true, "Orders fetched", {
            orders,
            totalOrders: orders.length
        });
    } catch (error) {
        next(error);
    }
};


const getStats = async (req, res, next) => {
    try {
        let orderQuery = {};
        let averageRating = 0;
        // owner stats
        if (req.user.role === "owner") {
            const restaurant = await Restaurant.findOne({
                owner: req.user._id
            });
            if (!restaurant) { throw new AppError("Restaurant not found", 404); }

            orderQuery.restaurant = restaurant._id;
            averageRating = restaurant.averageRating;
        }

        // total revenue
        const revenueResult = await Order.aggregate([
            {
                $match: {
                    ...orderQuery,
                    status: "delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice"
                    }
                }
            }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // total orders
        const totalOrders = await Order.countDocuments(orderQuery);

        // average rating (only restaurants with reviews)
        if (req.user.role === "superadmin") {

            const ratingResult = await Restaurant.aggregate([
                {
                    $match: {
                        numberOfReviews: { $gt: 0 }
                    }
                },
                {
                    $group: {
                        _id: null,
                        averageRating: {
                            $avg: "$averageRating"
                        }
                    }
                }
            ]);

            averageRating =
                ratingResult.length > 0
                    ? Number(ratingResult[0].averageRating.toFixed(1))
                    : 0;
        }

        // popular items
        const popularItems = await Order.aggregate([
            {
                $match: orderQuery
            },
            {
                $unwind: "$items"
            },
            {
                $group: {
                    _id: "$items.name",
                    totalSold: {
                        $sum: "$items.quantity"
                    }
                }
            },
            {
                $sort: {
                    totalSold: -1
                }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    totalSold: 1
                }
            }
        ]);

        return sendResponse(res, 200, true, "Stats fetched successfully", { totalRevenue, totalOrders, averageRating, popularItems});

    } catch (error) {
        next(error);
    }
};



module.exports = { 
  placeOrder, 
  getMyOrders, // user
  updateOrderStatus,
  getAllOrders, // superadmin
  getRestaurantOrders, // owner
  getStats
}

