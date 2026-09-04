const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config({ path: ".env.test" })

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log("TEST DATABASE:", mongoose.connection.name)
})

afterEach(async () => {
  const collections = mongoose.connection.collections

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})