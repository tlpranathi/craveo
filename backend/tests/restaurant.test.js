
const request = require("supertest")
const app = require("../app")
const Restaurant = require("../models/Restaurant")

describe("Restaurant API", () => {

    beforeEach(async () => {
        await Restaurant.create({
            name: "Test Restaurant",
            location: "Bangalore",
            cuisine: "Indian",
            averageRating: 4.5,
            numberOfReviews: 10
        })

        await Restaurant.create({
            name: "Pizza Place",
            location: "Mumbai",
            cuisine: "Italian",
            averageRating: 4.0,
            numberOfReviews: 5
        })
    })


    describe("GET /api/restaurants", () => {

        test("should return all restaurants", async () => {
            const response = await request(app)
                .get("/api/restaurants")

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.restaurants).toHaveLength(2)
            expect(response.body.data.totalRestaurants).toBe(2)
        })

        test("should filter restaurants by cuisine", async () => {
            const response = await request(app)
                .get("/api/restaurants")
                .query({ cuisine: "Indian" })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.restaurants).toHaveLength(1)
            expect(response.body.data.restaurants[0].cuisine).toBe("Indian")
        })

        test("should search restaurants by name", async () => {
            const response = await request(app)
                .get("/api/restaurants")
                .query({ search: "Pizza" })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.restaurants).toHaveLength(1)
            expect(response.body.data.restaurants[0].name).toBe("Pizza Place")
        })
    })


    describe("GET /api/restaurants/random", () => {

        test("should return random restaurants", async () => {
            const response = await request(app)
                .get("/api/restaurants/random")
                .query({ limit: 1 })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.restaurants).toHaveLength(1)
        })
    })


    describe("GET /api/restaurants/:id", () => {

        test("should return a restaurant by ID", async () => {
            const restaurant = await Restaurant.findOne({
                name: "Test Restaurant"
            })

            const response = await request(app)
                .get(`/api/restaurants/${restaurant._id}`)

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.data.name).toBe("Test Restaurant")
            expect(response.body.data.cuisine).toBe("Indian")
        })

        test("should return 404 for a nonexistent restaurant", async () => {
            const fakeId = "507f1f77bcf86cd799439011"

            const response = await request(app)
                .get(`/api/restaurants/${fakeId}`)

            expect(response.statusCode).toBe(404)
            expect(response.body.success).toBe(false)
        })
    })
})
