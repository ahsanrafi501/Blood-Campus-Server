import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@diu\.edu\.bd$/, "Please use a valid DIU email address"]
        },
        role: {
            type: String,
            enum: ["user", "donor", "donor-pending", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true,
    }
)

export const User = mongoose.model("User", userSchema)