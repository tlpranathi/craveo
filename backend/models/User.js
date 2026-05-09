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
        required: [true, "email is required"],
        unique: true, 
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Enter valid email id"],
    },
    password: {
        type: String, 
        required: [true, "password is required"],
        minlength: [6, "password must be atleast 6 characters"],
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
}, {    
    timestamps: true, // adds createdAt and updatedAt automatically
})

// pre save hook: hash passwords only when it's new or changed
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
})

// instance method: compare password at login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)

