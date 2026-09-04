const mongoose = require("mongoose")

// Mongoose buffers commands issued before the connection is ready, so a
// slow/first connect wouldn't otherwise reject with a clear error - it would
// just hang until bufferTimeoutMS. Keep buffering (default) but cap it, and
// tune the pool/timeouts for a small app on a free-tier cluster:
// - maxPoolSize: cap concurrent connections (Atlas free tier limits total
//   connections across the cluster)
// - minPoolSize: keep a couple of warm connections so requests right after
//   a cold start don't each pay full connection setup cost
// - serverSelectionTimeoutMS: fail fast instead of hanging if the cluster
//   is unreachable, so requests error out quickly rather than piling up
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })
        console.log("mongodb connected")
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

module.exports = connectDB

