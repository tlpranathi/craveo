const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be atleast 2 characters"],
        maxlength: [50, "Name cannot exceed 50 characters"],
        match: [/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true, // creates unique index in mongoDB
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/, "Enter valid email address"],
    },
    password: {
        type: String, 
        required: [true, "Password is required"],
        minlength: [6, "Password must be atleast 6 characters"],
    },
    role: {
        type: String,
        enum: ["user", "superadmin", "owner"],
        default: "user",
    },
}, {    
    timestamps: true, // adds createdAt and updatedAt automatically
})

// mongoose middleware/hook - runs automatically before saving a user document
// pre save hook: hash passwords only when it's new or changed
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return 
    this.password = await bcrypt.hash(this.password, 10) // 10 salt rounds
})

// instance method: compare password at login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)

