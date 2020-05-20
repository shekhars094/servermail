const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { ObjectId } = mongoose.Schema.Types;

// Schema for User Signup

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
        },
        mobile_number: {
            type: Number,
            required: true,
        },
        password: {
            type: String,
            trim: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Middleware Method for Encrypting The user Password

userSchema.pre("save", async function (next) {
    const rounds = 10;
    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;
    next();
});

// Instance Method For Checking The Password for login. That Password is Matched or Not

userSchema.methods.comparePassword = function (plaintext) {
    return bcrypt.compareSync(plaintext, this.password);
};

module.exports = mongoose.model("User", userSchema);
