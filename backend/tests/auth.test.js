const request = require("supertest")
const app = require("../app")
const User = require("../models/User")

describe("Authentication API", () => {

    describe("POST /api/auth/signup", () => {

        test("should create a new user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Test User",
                    email: "testuser@example.com",
                    password: "Password123!"
                })

            expect(response.statusCode).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.data.token).toBeDefined()
            expect(response.body.data.user.email).toBe("testuser@example.com")

            const user = await User.findOne({
                email: "testuser@example.com"
            })

            expect(user).not.toBeNull()
        })

        test("should reject duplicate email", async () => {
            await User.create({
                name: "Existing User",
                email: "existing@example.com",
                password: "Password123!"
            })

            const response = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Another User",
                    email: "existing@example.com",
                    password: "Password123!"
                })

            expect(response.statusCode).toBe(409)
            expect(response.body.success).toBe(false)
        })
    })


    describe("POST /api/auth/login", () => {

        test("should login with valid credentials", async () => {
            await User.create({
                name: "Login User",
                email: "login@example.com",
                password: "Password123!"
            })

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "login@example.com",
                    password: "Password123!"
                })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.token).toBeDefined()
            expect(response.body.data.user.email).toBe("login@example.com")
        })

        test("should reject invalid password", async () => {
            await User.create({
                name: "Wrong Password User",
                email: "wrongpassword@example.com",
                password: "Password123!"
            })

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "wrongpassword@example.com",
                    password: "WrongPassword123!"
                })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
        })
    })


    describe("Protected routes", () => {

        test("should reject request without token", async () => {
            const response = await request(app)
                .get("/api/users/profile")

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
        })

        test("should reject invalid token", async () => {
            const response = await request(app)
                .get("/api/users/profile")
                .set("Authorization", "Bearer invalid-token")

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
        })

        test("should allow request with valid token", async () => {
            const signupResponse = await request(app)
                .post("/api/auth/signup")
                .send({
                    name: "Protected User",
                    email: "protected@example.com",
                    password: "Password123!"
                })

            const token = signupResponse.body.data.token

            const response = await request(app)
                .get("/api/users/profile")
                .set("Authorization", `Bearer ${token}`)

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
        })
    })
})