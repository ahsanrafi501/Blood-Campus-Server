import mongoose, { Schema } from "mongoose";

const donorRegisterSchema = new Schema(
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
        avatar: {
            type: String, // Cloudinary URL
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
            min: [45, "Weight must be at least 45kg to donate"], // weight threshold check koro
            required: true,
        },
        lastDonationDate: {
            type: Date,
            default: null,
        },
        availableFrom: {
            type: Date, // Cooldown handle korar jonno
            default: null,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
        privacyMode: {
            type: String,
            enum: ["Public", "OnAccept"],
            default: "Public",
        },
        totalDonations: {
            type: Number,
            default: 0,
        },
        role: {
            type: String,
            enum: ["user", "donor", "donor-pending", "admin"],
            default: "donor-pending"
        },
        // 🔥 Donation History Array 🔥
        donationHistory: [
            {
                date: { type: Date, required: true },
                hospital: { type: String, required: true },
                note: { type: String },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    {
        timestamps: true
    }
);

// Virtual for eligibility (Last donation theke 90 din ba 3 mash count kora)
donorRegisterSchema.virtual('isEligible').get(function () {
    if (!this.lastDonationDate) return true;

    const today = new Date();
    const diffTime = Math.abs(today - this.lastDonationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 90; // Standard 90 days cooldown
});


donorRegisterSchema.set('toJSON', { virtuals: true });

export const DonorRegister = mongoose.model("DonorRegister", donorRegisterSchema);