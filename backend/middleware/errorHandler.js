const sendResponse = require("../utils/response")

const errorHandler = (err, req, res, next) => {
    console.error(err) // always log

    const statusCode = err.statusCode || 500

    return sendResponse(res, statusCode, false, err.message || "server error")
}

module.exports = errorHandler