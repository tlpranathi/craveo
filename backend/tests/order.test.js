const request = require("supertest")
const app = require("../app")
const User = require("../models/User")
const Restaurant = require("../models/Restaurant")
const Order = require("../models/Order")

describe("Order API", () => {

    let user
    let token
    let restaurant

    beforeEach(async () => {
        // Create test user
        const signupResponse = await request(app)
            .post("/api/auth/signup")
            .send({
                name: "Order Test User",
                email: "orderuser@example.com",
                password: "Password123!"
            })

        token = signupResponse.body.data.token

        user = await User.findOne({
            email: "orderuser@example.com"
        })

        // Create test restaurant
        restaurant = await Restaurant.create({
            name: "Order Test Restaurant",
            location: "Bangalore",
            cuisine: "Indian"
        })
    })


    describe("POST /api/orders", () => {

        test("should place an order successfully", async () => {
            const response = await request(app)
                .post("/api/orders")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    restaurantId: restaurant._id,
                    items: [
                        {
                            _id: "507f1f77bcf86cd799439011",
                            name: "Paneer Tikka",
                            price: 200,
                            quantity: 2
                        },
                        {
                            _id: "507f191e810c19729de860ea",
                            name: "Naan",
                            price: 50,
                            quantity: 2
                        }
                    ]
                })

            expect(response.statusCode).toBe(201)
            expect(response.body.success).toBe(true)

            const order = response.body.data.order

            expect(order).toBeDefined()
            expect(order.totalPrice).toBe(500)
            expect(order.status).toBe("pending")
            expect(order.items).toHaveLength(2)

            const savedOrder = await Order.findById(order._id)

            expect(savedOrder).not.toBeNull()
            expect(savedOrder.user.toString()).toBe(user._id.toString())
            expect(savedOrder.restaurant.toString())
                .toBe(restaurant._id.toString())
        })


        test("should reject placing an order without authentication", async () => {
            const response = await request(app)
                .post("/api/orders")
                .send({
                    restaurantId: restaurant._id,
                    items: [
                        {
                            _id: "507f1f77bcf86cd799439011",
                            name: "Burger",
                            price: 200,
                            quantity: 1
                        }
                    ]
                })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
        })
    })


    describe("GET /api/orders/my-orders", () => {

        test("should return the logged-in user's orders", async () => {
            await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: "507f1f77bcf86cd799439011",
                        name: "Burger",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200
            })

            const response = await request(app)
                .get("/api/orders/my-orders")
                .set("Authorization", `Bearer ${token}`)

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.orders).toHaveLength(1)
            expect(response.body.data.totalOrders).toBe(1)
            expect(response.body.data.orders[0].totalPrice).toBe(200)
        })


        test("should return an empty list when user has no orders", async () => {
            const response = await request(app)
                .get("/api/orders/my-orders")
                .set("Authorization", `Bearer ${token}`)

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.orders).toHaveLength(0)
            expect(response.body.data.totalOrders).toBe(0)
        })
    })


    test("should not return another user's orders", async () => {
        const otherUser = await User.create({
            name: "Other User",
            email: "otheruser@example.com",
            password: "Password123!"
        })

        await Order.create({
            user: otherUser._id,
            restaurant: restaurant._id,
            items: [
                {
                    menuItemId: "507f1f77bcf86cd799439011",
                    name: "Pizza",
                    price: 300,
                    quantity: 1
                }
            ],
            totalPrice: 300
        })

        const response = await request(app)
            .get("/api/orders/my-orders")
            .set("Authorization", `Bearer ${token}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.data.orders).toHaveLength(0)
        expect(response.body.data.totalOrders).toBe(0)
    })


    describe("PATCH /api/orders/:id/status", () => {

        test("should allow user to cancel their own pending order", async () => {
            const order = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: "507f1f77bcf86cd799439011",
                        name: "Burger",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200,
                status: "pending"
            })

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "cancelled"
                })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.order.status).toBe("cancelled")

            const updatedOrder = await Order.findById(order._id)

            expect(updatedOrder.status).toBe("cancelled")
        })


        test("should not allow user to cancel another user's order", async () => {
            const otherUser = await User.create({
                name: "Other User",
                email: "cancelother@example.com",
                password: "Password123!"
            })

            const order = await Order.create({
                user: otherUser._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: "507f1f77bcf86cd799439011",
                        name: "Pizza",
                        price: 300,
                        quantity: 1
                    }
                ],
                totalPrice: 300,
                status: "pending"
            })

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "cancelled"
                })

            expect(response.statusCode).toBe(403)
            expect(response.body.success).toBe(false)
        })


        test("should not allow cancellation of a non-pending order", async () => {
            const order = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: "507f1f77bcf86cd799439011",
                        name: "Burger",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200,
                status: "confirmed"
            })

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "cancelled"
                })

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
        })


        test("should not allow cancellation after one minute", async () => {
            const order = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: "507f1f77bcf86cd799439011",
                        name: "Burger",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200,
                status: "pending",
                createdAt: new Date(Date.now() - 2 * 60 * 1000)
            })

            const response = await request(app)
                .patch(`/api/orders/${order._id}/status`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "cancelled"
                })

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
        })


        test("should return 404 for a nonexistent order", async () => {
            const fakeId = "507f1f77bcf86cd799439011"

            const response = await request(app)
                .patch(`/api/orders/${fakeId}/status`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    status: "cancelled"
                })

            expect(response.statusCode).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })
})