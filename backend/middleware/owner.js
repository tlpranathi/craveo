const AppError = require("../utils/AppError")

const owner = (req, res, next) => {

    if (req.user.role !== "owner") {
        return next(new AppError("Owner access required", 403))
    }
    next()
}

module.exports = owner