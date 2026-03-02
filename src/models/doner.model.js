import mongoose, { Schema } from "mongoose";

const donorSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        studentId: {
            type: String,
            required: [true, "Student ID is required"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "DIU email is required"],
            unique: true,
            lowercase: true,
            match: [/^[\w-\.]+@diu\.edu\.bd$/, "Please use a valid DIU email address"],
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
        },
        department: {
            type: String,
            required: true,
            enum: ["CSE", "SWE", "EEE", "Pharmacy", "BBA", "English", "CIS", "ITM", "NFE", "MIS", "Other"],
        },
        presentAddress: {
            type: String,
            required: [true, "Present address is required"],
        },
        bloodGroup: {
            type: String,
            required: true,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        },
        gender: {
            type: String,
            required: true,
            enum: ["Male", "Female"],
        },
        weight: {
            type: Number,
            min: [50, "Weight must be at least 50kg to donate"],
            required: true,
        },
        lastDonationDate: {
            type: Date,
            default: null,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        privacyMode: {
            type: String,
            enum: ["Public", "OnAccept"],
            default: "OnAccept",
        },
        totalDonations: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true
    }
);

donorSchema.virtual('isEligible').get(function() {
    if (!this.lastDonationDate) return true;

    const today = new Date();
    const diffTime = Math.abs(today - this.lastDonationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 120;
});

donorSchema.set('toJSON', { virtuals: true });

export const Donor = mongoose.model("Donor", donorSchema);