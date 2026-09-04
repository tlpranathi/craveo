const request = require("supertest")
const mongoose = require("mongoose")

const app = require("../app")

const User = require("../models/User")
const Restaurant = require("../models/Restaurant")
const Order = require("../models/Order")
const Review = require("../models/Review")


describe("Review API", () => {

    describe("POST /api/reviews", () => {

        let user
        let otherUser
        let restaurant
        let deliveredOrder
        let pendingOrder
        let userToken
        let otherUserToken


        beforeEach(async () => {

            // Create first user
            const userResponse = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Review User",
                    email: "reviewuser@example.com",
                    password: "Password123!"
                })

            expect(userResponse.statusCode).toBe(201)

            userToken = userResponse.body.data.token

            user = await User.findOne({
                email: "reviewuser@example.com"
            })


            // Create second user
            const otherUserResponse = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Other User",
                    email: "otheruser@example.com",
                    password: "Password123!"
                })

            expect(otherUserResponse.statusCode).toBe(201)

            otherUserToken = otherUserResponse.body.data.token

            otherUser = await User.findOne({
                email: "otheruser@example.com"
            })


            // Create restaurant
            restaurant = await Restaurant.create({
                name: "Test Restaurant",
                location: "Test Location",
                cuisine: "Indian"
            })


            // Delivered order
            deliveredOrder = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: new mongoose.Types.ObjectId(),
                        name: "Paneer Tikka",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200,
                status: "delivered"
            })


            // Pending order
            pendingOrder = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: new mongoose.Types.ObjectId(),
                        name: "Biryani",
                        price: 250,
                        quantity: 1
                    }
                ],
                totalPrice: 250,
                status: "pending"
            })
        })


        test("should create a review for user's delivered order", async () => {

            const response = await request(app)
                .post("/api/reviews")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    orderId: deliveredOrder._id,
                    rating: 4.5,
                    comment: "Really good food!"
                })


            expect(response.statusCode).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()


            const review = await Review.findOne({
                order: deliveredOrder._id
            })


            expect(review).not.toBeNull()

            expect(review.user.toString())
                .toBe(user._id.toString())

            expect(review.restaurant.toString())
                .toBe(restaurant._id.toString())

            expect(review.rating).toBe(4.5)

            expect(review.comment)
                .toBe("Really good food!")
        })


        test("should reject review for another user's order", async () => {

            const response = await request(app)
                .post("/api/reviews")
                .set("Authorization", `Bearer ${otherUserToken}`)
                .send({
                    orderId: deliveredOrder._id,
                    rating: 5,
                    comment: "Trying to review someone else's order"
                })


            expect(response.statusCode).toBe(403)
            expect(response.body.success).toBe(false)


            const review = await Review.findOne({
                order: deliveredOrder._id
            })

            expect(review).toBeNull()
        })


        test("should reject review for an order that is not delivered", async () => {

            const response = await request(app)
                .post("/api/reviews")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    orderId: pendingOrder._id,
                    rating: 4,
                    comment: "This should not work"
                })


            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)


            const review = await Review.findOne({
                order: pendingOrder._id
            })

            expect(review).toBeNull()
        })


        test("should reject duplicate review for the same order", async () => {

            await Review.create({
                user: user._id,
                restaurant: restaurant._id,
                order: deliveredOrder._id,
                rating: 4,
                comment: "First review"
            })


            const response = await request(app)
                .post("/api/reviews")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    orderId: deliveredOrder._id,
                    rating: 5,
                    comment: "Second review"
                })


            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)


            const reviews = await Review.find({
                order: deliveredOrder._id
            })

            expect(reviews).toHaveLength(1)
        })


        test("should reject review for a nonexistent order", async () => {

            const fakeOrderId = new mongoose.Types.ObjectId()


            const response = await request(app)
                .post("/api/reviews")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    orderId: fakeOrderId,
                    rating: 4,
                    comment: "This order does not exist"
                })


            expect(response.statusCode).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })


    // --------------------------------------------------
    // GET REVIEWS
    // --------------------------------------------------

    describe("GET /api/reviews/:restaurantId", () => {

        let user
        let restaurant
        let order


        beforeEach(async () => {

            user = await User.create({
                name: "Review Reader",
                email: "reader@example.com",
                password: "Password123!"
            })


            restaurant = await Restaurant.create({
                name: "Review Restaurant",
                location: "Test Location",
                cuisine: "Indian"
            })


            order = await Order.create({
                user: user._id,
                restaurant: restaurant._id,
                items: [
                    {
                        menuItemId: new mongoose.Types.ObjectId(),
                        name: "Pizza",
                        price: 300,
                        quantity: 1
                    }
                ],
                totalPrice: 300,
                status: "delivered"
            })


            await Review.create({
                user: user._id,
                restaurant: restaurant._id,
                order: order._id,
                rating: 4,
                comment: "Good food"
            })
        })


        test("should return restaurant reviews with pagination", async () => {

            const response = await request(app)
                .get(`/api/reviews/${restaurant._id}`)
                .query({
                    page: 1,
                    limit: 5
                })


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data.reviews)
                .toHaveLength(1)

            expect(response.body.data.totalReviews)
                .toBe(1)

            expect(response.body.data.page)
                .toBe(1)

            expect(response.body.data.limit)
                .toBe(5)

            expect(response.body.data.reviews[0].rating)
                .toBe(4)

            expect(response.body.data.reviews[0].comment)
                .toBe("Good food")
        })
    })


    // --------------------------------------------------
    // REVIEW SUMMARY
    // --------------------------------------------------

    describe("GET /api/reviews/:restaurantId/summary", () => {

        let restaurant


        beforeEach(async () => {

            restaurant = await Restaurant.create({
                name: "Summary Restaurant",
                location: "Test Location",
                cuisine: "Indian"
            })
        })


        test("should return no summary when restaurant has no reviews", async () => {

            const response = await request(app)
                .get(`/api/reviews/${restaurant._id}/summary`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data.summary)
                .toBeNull()

            expect(response.body.data.source)
                .toBe("none")
        })
    })
})