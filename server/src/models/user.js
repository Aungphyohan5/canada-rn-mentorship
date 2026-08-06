import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["nurse", "employer", "admin"],
            default: "nurse",
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        profileImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }

);

export default mongoose.model("User", userSchema);