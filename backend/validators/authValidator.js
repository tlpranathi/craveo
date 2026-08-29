const { body } = require("express-validator")

const signupValidator = [
    body("name").notEmpty().withMessage("Name is required").isLength({min:3}).withMessage("Name must be atleast 3 characters long"),
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be atleast 6 characters long"),
]

const loginValidator = [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
]

const forgotPasswordValidator = [
    body("email").notEmpty().withMessage("Email is required").isEmail().withMessage("Please provide a valid email"),
]

const resetPasswordValidator = [
    body("password").notEmpty().withMessage("Password is required").isLength({min:6}).withMessage("Password must be atleast 6 characters long"),
]

module.exports = {signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator}