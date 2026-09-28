const request = require("supertest")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const app = require("../app")
const User = require("../models/User")
const Coupon = require("../models/Coupon")
const Order = require("../models/Order")

const createToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
}

describe("Coupon API", () => {
    let admin
    let user
    let adminToken
    let userToken

    beforeEach(async () => {
        admin = await User.create({
            name: "Coupon Admin",
            email: `admin-${Date.now()}@test.com`,
            password: "password123",
            role: "superadmin",
        })

        user = await User.create({
            name: "Coupon User",
            email: `user-${Date.now()}@test.com`,
            password: "password123",
            role: "user",
        })

        adminToken = createToken(admin)
        userToken = createToken(user)
    })

    // ---------------- ADMIN ----------------

    test("admin can create a percentage coupon", async () => {
        const response = await request(app)
            .post("/api/coupons")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "WELCOME50",
                description: "50% off",
                discountType: "percentage",
                discountValue: 50,
                minOrdersRequired: 0,
                minOrderValue: 500,
                maxDiscountAmount: 200,
            })

        expect(response.statusCode).toBe(201)
        expect(response.body.data.coupon.code).toBe("WELCOME50")
        expect(response.body.data.coupon.discountType).toBe("percentage")
        expect(response.body.data.coupon.discountValue).toBe(50)
    })

    test("admin can create a flat coupon", async () => {
        const response = await request(app)
            .post("/api/coupons")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "FLAT100",
                discountType: "flat",
                discountValue: 100,
            })

        expect(response.statusCode).toBe(201)
        expect(response.body.data.coupon.code).toBe("FLAT100")
        expect(response.body.data.coupon.discountType).toBe("flat")
    })

    test("duplicate coupon code is rejected", async () => {
        await Coupon.create({
            code: "DUPLICATE",
            discountType: "flat",
            discountValue: 100,
            createdBy: admin._id,
        })

        const response = await request(app)
            .post("/api/coupons")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "DUPLICATE",
                discountType: "flat",
                discountValue: 50,
            })

        expect(response.statusCode).toBe(400)
    })

    test("percentage discount above 100 is rejected", async () => {
        const response = await request(app)
            .post("/api/coupons")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "BADPERCENT",
                discountType: "percentage",
                discountValue: 150,
            })

        expect(response.statusCode).toBe(400)
    })

    test("admin can get all coupons", async () => {
        await Coupon.create([
            {
                code: "SAVE10",
                discountType: "percentage",
                discountValue: 10,
                createdBy: admin._id,
            },
            {
                code: "SAVE20",
                discountType: "percentage",
                discountValue: 20,
                createdBy: admin._id,
            },
        ])

        const response = await request(app)
            .get("/api/coupons")
            .set("Authorization", `Bearer ${adminToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupons).toHaveLength(2)
    })

    test("admin can update a coupon", async () => {
        const coupon = await Coupon.create({
            code: "UPDATE10",
            discountType: "percentage",
            discountValue: 10,
            createdBy: admin._id,
        })

        const response = await request(app)
            .patch(`/api/coupons/${coupon._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                discountValue: 25,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupon.discountValue).toBe(25)
    })

    test("admin can deactivate a coupon", async () => {
        const coupon = await Coupon.create({
            code: "ACTIVE10",
            discountType: "percentage",
            discountValue: 10,
            createdBy: admin._id,
        })

        const response = await request(app)
            .patch(`/api/coupons/${coupon._id}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                isActive: false,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupon.isActive).toBe(false)
    })

    test("admin can delete a coupon", async () => {
        const coupon = await Coupon.create({
            code: "DELETE10",
            discountType: "percentage",
            discountValue: 10,
            createdBy: admin._id,
        })

        const response = await request(app)
            .delete(`/api/coupons/${coupon._id}`)
            .set("Authorization", `Bearer ${adminToken}`)

        expect(response.statusCode).toBe(200)

        const deleted = await Coupon.findById(coupon._id)
        expect(deleted).toBeNull()
    })

    test("normal user cannot manage coupons", async () => {
        const response = await request(app)
            .post("/api/coupons")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "USERCOUPON",
                discountType: "flat",
                discountValue: 100,
            })

        expect(response.statusCode).toBe(403)
    })

    // ---------------- CUSTOMER ----------------

    test("user can see available coupons", async () => {
        await Coupon.create({
            code: "AVAILABLE20",
            discountType: "percentage",
            discountValue: 20,
            isActive: true,
            minOrdersRequired: 0,
        })

        const response = await request(app)
            .get("/api/coupons/available")
            .set("Authorization", `Bearer ${userToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupons).toHaveLength(1)
        expect(response.body.data.coupons[0].code).toBe("AVAILABLE20")
    })

    test("inactive coupon is not available", async () => {
        await Coupon.create({
            code: "INACTIVE",
            discountType: "percentage",
            discountValue: 20,
            isActive: false,
        })

        const response = await request(app)
            .get("/api/coupons/available")
            .set("Authorization", `Bearer ${userToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupons).toHaveLength(0)
    })

    test("expired coupon is not available", async () => {
        await Coupon.create({
            code: "EXPIRED",
            discountType: "percentage",
            discountValue: 20,
            isActive: true,
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })

        const response = await request(app)
            .get("/api/coupons/available")
            .set("Authorization", `Bearer ${userToken}`)

        expect(response.statusCode).toBe(200)
        expect(response.body.data.coupons).toHaveLength(0)
    })

    test("coupon is rejected when cart is below minimum order value", async () => {
        await Coupon.create({
            code: "MIN500",
            discountType: "percentage",
            discountValue: 20,
            minOrderValue: 500,
        })

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "MIN500",
                cartTotal: 400,
            })

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toContain("Minimum order value")
    })

    test("coupon is rejected when user has insufficient delivered orders", async () => {
        await Coupon.create({
            code: "LOYAL20",
            discountType: "percentage",
            discountValue: 20,
            minOrdersRequired: 2,
        })

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "LOYAL20",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(400)
        expect(response.body.message).toContain("delivered orders")
    })

    test("percentage coupon calculates discount correctly", async () => {
        await Coupon.create({
            code: "PERCENT20",
            discountType: "percentage",
            discountValue: 20,
        })

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "PERCENT20",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.discountAmount).toBe(200)
        expect(response.body.data.finalTotal).toBe(800)
    })

    test("percentage coupon respects maximum discount cap", async () => {
        await Coupon.create({
            code: "CAPPED20",
            discountType: "percentage",
            discountValue: 20,
            maxDiscountAmount: 100,
        })

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "CAPPED20",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.discountAmount).toBe(100)
        expect(response.body.data.finalTotal).toBe(900)
    })

    test("flat coupon calculates discount correctly", async () => {
        await Coupon.create({
            code: "FLAT200",
            discountType: "flat",
            discountValue: 200,
        })

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "FLAT200",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.discountAmount).toBe(200)
        expect(response.body.data.finalTotal).toBe(800)
    })

    test("invalid coupon code is rejected", async () => {
        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "DOESNOTEXIST",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(404)
    })

    test("coupon validation requires authentication", async () => {
        const response = await request(app)
            .post("/api/coupons/validate")
            .send({
                code: "SAVE20",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(401)
    })

    test("user with enough delivered orders can use restricted coupon", async () => {
        await Coupon.create({
            code: "LOYAL50",
            discountType: "percentage",
            discountValue: 50,
            minOrdersRequired: 2,
        })

        await Order.create([
            {
                user: user._id,
                restaurant: new mongoose.Types.ObjectId(),
                items: [],
                subtotal: 1000,
                totalPrice: 1000,
                status: "delivered",
            },
            {
                user: user._id,
                restaurant: new mongoose.Types.ObjectId(),
                items: [],
                subtotal: 1000,
                totalPrice: 1000,
                status: "delivered",
            },
        ])

        const response = await request(app)
            .post("/api/coupons/validate")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                code: "LOYAL50",
                cartTotal: 1000,
            })

        expect(response.statusCode).toBe(200)
        expect(response.body.data.discountAmount).toBe(500)
        expect(response.body.data.finalTotal).toBe(500)
    })
})
