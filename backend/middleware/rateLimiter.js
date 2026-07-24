const rateLimit = require("express-rate-limit")
const sendResponse = require("../utils/response")

// limit requests to auth routes to prevent brute-force attacks
const authLimiter = rateLimit({
    // 15-minute time window
    windowMs: 15 * 60 * 1000,
    // max 10 requests per IP during the window
    max: 10,
    // return JSON response instead of default HTML/text
    handler: (req, res) => {
        return sendResponse(res, 429, false, "Too many login/signup attempts. Please try again later.")},
    // standard rate limit headers
    standardHeaders: true,
    // disable legacy X-RateLimit headers
    legacyHeaders: false,
})

module.exports = authLimiter