const express = require("express")
const router = express.Router()
const protect = require("../middleware/protect")
const { getProfile, updateProfile, changePassword } = require("../controllers/userController")
const { validate } = require("../middleware/validator")
const { updateProfileValidator, changePasswordValidator } = require("../validators/userValidator")

router.use(protect)

router.get("/profile", getProfile)                      
router.put("/profile", updateProfileValidator, validate, updateProfile)             
router.put("/change-password", changePasswordValidator, validate, changePassword)   

module.exports = router
