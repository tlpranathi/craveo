const request = require("supertest")
const app = require("../app")

describe("Craveo API", () => {
  test("GET / should return API status", async () => {
    const response = await request(app).get("/")

    expect(response.statusCode).toBe(200)
    expect(response.text).toBe("craveo API running")
  })
})
