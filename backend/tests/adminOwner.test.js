const request = require("supertest")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const app = require("../app")

const User = require("../models/User")
const Restaurant = require("../models/Restaurant")
const Order = require("../models/Order")
const Menu = require("../models/Menu")


describe("Admin and Owner API", () => {

    let adminUser
    let ownerUser
    let normalUser

    let adminToken
    let ownerToken
    let normalToken

    let ownerRestaurant
    let otherRestaurant


    beforeEach(async () => {

        // -----------------------------------------
        // Create normal user
        // -----------------------------------------

        normalUser = await User.create({
            name: "Normal User",
            email: "normal@example.com",
            password: "Password123!",
            role: "user"
        })

        normalToken = jwt.sign(
            { id: normalUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )


        // -----------------------------------------
        // Create owner
        // -----------------------------------------

        ownerUser = await User.create({
            name: "Restaurant Owner",
            email: "owner@example.com",
            password: "Password123!",
            role: "owner"
        })

        ownerToken = jwt.sign(
            { id: ownerUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )


        // -----------------------------------------
        // Create admin
        // -----------------------------------------

        adminUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "Password123!",
            role: "superadmin"
        })

        adminToken = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )


        // -----------------------------------------
        // Create owner's restaurant
        // -----------------------------------------

        ownerRestaurant = await Restaurant.create({
            name: "Owner Restaurant",
            location: "Test Location",
            cuisine: "Indian",
            owner: ownerUser._id
        })


        // -----------------------------------------
        // Create another restaurant
        // -----------------------------------------

        otherRestaurant = await Restaurant.create({
            name: "Other Restaurant",
            location: "Other Location",
            cuisine: "Italian"
        })
    })


    // ==================================================
    // ADMIN ROUTES
    // ==================================================

    describe("Admin routes", () => {

        test("should allow admin to access stats", async () => {

            const response = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${adminToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data).toBeDefined()

            expect(response.body.data.totalRevenue).toBe(0)

            expect(response.body.data.totalOrders).toBe(0)

            expect(response.body.data.averageRating).toBe(0)

            expect(response.body.data.popularItems).toEqual([])
        })


        test("should reject normal user from admin stats", async () => {

            const response = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${normalToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)
        })


        test("should allow admin to get owners", async () => {

            const response = await request(app)
                .get("/api/admin/owners")
                .set("Authorization", `Bearer ${adminToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data.owners).toBeDefined()

            expect(response.body.data.owners).toHaveLength(1)

            expect(response.body.data.owners[0].email)
                .toBe("owner@example.com")
        })


        test("should reject normal user from getting owners", async () => {

            const response = await request(app)
                .get("/api/admin/owners")
                .set("Authorization", `Bearer ${normalToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)
        })


        test("should reject owner from admin routes", async () => {

            const response = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)
        })
    })


    // ==================================================
    // OWNER ROUTES
    // ==================================================

    describe("Owner routes", () => {

        test("should allow owner to get restaurant orders", async () => {

            await Order.create({
                user: normalUser._id,
                restaurant: ownerRestaurant._id,
                items: [
                    {
                        menuItemId: new mongoose.Types.ObjectId(),
                        name: "Burger",
                        price: 200,
                        quantity: 1
                    }
                ],
                totalPrice: 200,
                status: "pending"
            })


            const response = await request(app)
                .get("/api/owner/orders")
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data.orders).toHaveLength(1)

            expect(response.body.data.totalOrders).toBe(1)
        })


        test("should reject normal user from owner routes", async () => {

            const response = await request(app)
                .get("/api/owner/orders")
                .set("Authorization", `Bearer ${normalToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)
        })


        test("should allow owner to get their restaurant menu", async () => {

            await Menu.create({
                restaurantId: ownerRestaurant._id,
                name: "burger",
                price: 200,
                description: "Test burger"
            })


            const response = await request(app)
                .get("/api/owner/menu")
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data).toHaveLength(1)

            expect(response.body.data[0].name)
                .toBe("burger")
        })


        test("should allow owner to create a menu item", async () => {

            const response = await request(app)
                .post("/api/owner/menu")
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    restaurantId: ownerRestaurant._id,
                    name: "Chicken Biryani",
                    price: 300,
                    description: "Delicious biryani"
                })


            expect(response.statusCode).toBe(201)

            expect(response.body.success).toBe(true)


            const menuItem = await Menu.findOne({
                restaurantId: ownerRestaurant._id,
                name: "chicken biryani"
            })


            expect(menuItem).not.toBeNull()

            expect(menuItem.price).toBe(300)

            expect(menuItem.description)
                .toBe("Delicious biryani")
        })


        test("should allow owner to update their own menu item", async () => {

            const menuItem = await Menu.create({
                restaurantId: ownerRestaurant._id,
                name: "burger",
                price: 200,
                description: "Old description"
            })


            const response = await request(app)
                .put(`/api/owner/menu/${menuItem._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    price: 250,
                    description: "Updated description"
                })


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)


            const updatedItem = await Menu.findById(menuItem._id)

            expect(updatedItem.price).toBe(250)

            expect(updatedItem.description)
                .toBe("Updated description")
        })


        test("should reject owner from updating another restaurant's menu item", async () => {

            const menuItem = await Menu.create({
                restaurantId: otherRestaurant._id,
                name: "pasta",
                price: 400,
                description: "Other restaurant item"
            })


            const response = await request(app)
                .put(`/api/owner/menu/${menuItem._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)
                .send({
                    price: 100
                })


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)


            const unchangedItem = await Menu.findById(menuItem._id)

            expect(unchangedItem.price).toBe(400)
        })


        test("should allow owner to delete their own menu item", async () => {

            const menuItem = await Menu.create({
                restaurantId: ownerRestaurant._id,
                name: "pizza",
                price: 350
            })


            const response = await request(app)
                .delete(`/api/owner/menu/${menuItem._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)


            const deletedItem = await Menu.findById(menuItem._id)

            expect(deletedItem).toBeNull()
        })


        test("should reject owner from deleting another restaurant's menu item", async () => {

            const menuItem = await Menu.create({
                restaurantId: otherRestaurant._id,
                name: "lasagna",
                price: 450
            })


            const response = await request(app)
                .delete(`/api/owner/menu/${menuItem._id}`)
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)


            const stillExists = await Menu.findById(menuItem._id)

            expect(stillExists).not.toBeNull()
        })


        test("should allow owner to access their stats", async () => {

            await Order.create({
                user: normalUser._id,
                restaurant: ownerRestaurant._id,
                items: [
                    {
                        menuItemId: new mongoose.Types.ObjectId(),
                        name: "Burger",
                        price: 200,
                        quantity: 2
                    }
                ],
                totalPrice: 400,
                status: "delivered"
            })


            const response = await request(app)
                .get("/api/owner/stats")
                .set("Authorization", `Bearer ${ownerToken}`)


            expect(response.statusCode).toBe(200)

            expect(response.body.success).toBe(true)

            expect(response.body.data.totalOrders).toBe(1)

            expect(response.body.data.totalRevenue).toBe(400)

            expect(response.body.data.popularItems).toHaveLength(1)

            expect(response.body.data.popularItems[0].name)
                .toBe("Burger")

            expect(response.body.data.popularItems[0].totalSold)
                .toBe(2)
        })


        test("should reject normal user from owner stats", async () => {

            const response = await request(app)
                .get("/api/owner/stats")
                .set("Authorization", `Bearer ${normalToken}`)


            expect(response.statusCode).toBe(403)

            expect(response.body.success).toBe(false)
        })
    })
})