import mongoose, { Schema } from "mongoose";

const bloodRequestSchema = new Schema(
    {
        requesterName: {
            type: String,
            required: true,
            trim: true,
        },
        bloodGroupNeeded: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        hospitalName: {
            type: String,
            required: [true, "Hospital name is required (e.g., Enam Medical)"],
        },
        location: {
            type: String,
            required: true,
        },
        contactNumber: {
            type: String,
            required: true,
        },
        urgency: {
            type: String,
            enum: ["Low", "Medium", "High", "Emergency"],
            default: "Medium",
        },
        unitsNeeded: {
            type: Number,
            default: 1,
        },
        status: {
            type: String,
            enum: ["Pending", "Accepted", "Completed", "Canceled"],
            default: "Pending",
        },
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    },
    {
        timestamps: true
    }
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export default BloodRequest;