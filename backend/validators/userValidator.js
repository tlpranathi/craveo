const { body } = require("express-validator")

const updateProfileValidator = [
    body("name").notEmpty().withMessage("Name is required").isLength({min:3}).withMessage("Name must be atleast 3 characters long"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),
]

const changePasswordValidator = [
    body("currentPassword").notEmpty().withMessage("Email is required"),
    body("newPassword").notEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be atleast 6 characters long"),
]

module.exports = {updateProfileValidator, changePasswordValidator}