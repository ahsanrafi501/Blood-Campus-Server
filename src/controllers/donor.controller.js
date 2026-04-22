import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DonorRegister } from "../models/donorRegister.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import BloodRequest from "../models/bloodRequest.model.js";

// 1. Donor Registration Logic
const registerDonor = asyncHandler(async (req, res) => {
    const {
        fullName,
        studentId,
        email,
        phone,
        department,
        presentAddress,
        bloodGroup,
        gender,
        weight,
        lastDonationDate,
        privacyMode,
        totalDonations,
        isAvailable,
    } = req.body;

    if (
        [fullName, studentId, email, phone, department, presentAddress, bloodGroup, gender]
            .some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All required fields are required");
    }

    if (weight && weight <= 0) {
        throw new ApiError(400, "Weight must be positive");
    }

    const existingDonor = await DonorRegister.findOne({
        $or: [
            { email: email?.toLowerCase() },
            { phone },
            { studentId }
        ]
    });

    if (existingDonor) {
        throw new ApiError(
            409,
            "Donor with this email, student Id or phone number is already exists"
        );
    }

    let avatarImageLocalPath;
    if (req.files?.avatar?.[0]?.path) {
        avatarImageLocalPath = req.files.avatar[0].path;
    }

    let avatar;
    if (avatarImageLocalPath) {
        avatar = await uploadOnCloudinary(avatarImageLocalPath);
    }

    const donor = await DonorRegister.create({
        fullName,
        studentId,
        email: email.toLowerCase(),
        phone,
        department,
        presentAddress,
        bloodGroup,
        gender,
        weight,
        lastDonationDate: lastDonationDate || null,
        privacyMode: privacyMode || "Public",
        totalDonations: totalDonations || 0,
        isAvailable: isAvailable || true,
        avatar: avatar?.url || "",
        role: "donor-pending"
    });

    const createdDonor = await DonorRegister.findById(donor._id);

    if (!createdDonor) {
        throw new ApiError(500, "Something went wrong while creating donor.");
    }

    res.status(201).json(
        new ApiResponse(201, createdDonor, "Donor requested successfully")
    );
});

// 2. Get Donors List with Filters & Pagination
const getDonors = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { bloodGroup, city, area, subArea } = req.query;

    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;

    if (city) filter.presentAddress = { $regex: city, $options: 'i' };
    if (area) filter.presentAddress = { $regex: area, $options: 'i' };
    if (subArea) filter.presentAddress = { $regex: subArea, $options: 'i' };

    const skip = (page - 1) * limit;

    const donors = await DonorRegister.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await DonorRegister.countDocuments(filter);

    res.status(200).json(
        new ApiResponse(200, { 
            donors, 
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page * limit < total
        }, "Donors fetched successfully")
    );
});

// 3. Add Donation History & Cooldown Logic
const addDonationHistory = asyncHandler(async (req, res) => {
    const { email, date, hospital, note, nextAvailableDate } = req.body;

    const updatedDonor = await DonorRegister.findOneAndUpdate(
        { email: email?.toLowerCase() },
        { 
            $push: { 
                donationHistory: { 
                    $each: [{ date, hospital, note }], 
                    $position: 0 
                } 
            },
            $set: {
                lastDonationDate: date,
                isAvailable: false,
                availableFrom: nextAvailableDate,
            },
            $inc: { totalDonations: 1 }
        },
        { returnDocument: 'after', runValidators: true } 
    );

    if (!updatedDonor) {
        throw new ApiError(404, "Donor not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedDonor.donationHistory, "Donation record added successfully")
    );
});

// 4. Get Donation History
const getDonationHistory = asyncHandler(async (req, res) => {
    const { email } = req.params;

    const donor = await DonorRegister.findOne({ email: email?.toLowerCase() });

    if (!donor) {
        throw new ApiError(404, "Donor profile not found");
    }

    res.status(200).json(
        new ApiResponse(200, donor.donationHistory, "History fetched successfully")
    );
});

// 5. Update Specific Donation History
const updateDonationHistory = asyncHandler(async (req, res) => {
    const { historyId } = req.params;
    const { email, date, hospital, note, nextAvailableDate } = req.body;

    if (!historyId || !email) {
        throw new ApiError(400, "History ID and Email are required");
    }

    const updatedDonor = await DonorRegister.findOneAndUpdate(
        { 
            email: email.toLowerCase(), 
            "donationHistory._id": historyId 
        },
        {
            $set: {
                "donationHistory.$.date": date,
                "donationHistory.$.hospital": hospital,
                "donationHistory.$.note": note,
                lastDonationDate: date, 
                availableFrom: nextAvailableDate
            }
        },
        { returnDocument: 'after' }
    );

    if (!updatedDonor) {
        throw new ApiError(404, "Donor or History record not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedDonor.donationHistory, "History updated successfully")
    );
});

// 6. Delete Specific Donation History
const deleteDonationHistory = asyncHandler(async (req, res) => {
    const { historyId } = req.params;
    const { email } = req.query;

    if (!historyId || !email) {
        throw new ApiError(400, "Missing history ID or email");
    }

    const updatedDonor = await DonorRegister.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
            $pull: { donationHistory: { _id: historyId } },
            $inc: { totalDonations: -1 }
        },
        { returnDocument: 'after' }
    );

    if (!updatedDonor) {
        throw new ApiError(404, "Donor not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedDonor.donationHistory, "History record deleted successfully")
    );
});



// 7. Get Single Donor Profile for Editing
// donor.controller.js
const getDonorProfile = asyncHandler(async (req, res) => {
    const { email } = req.params;
    const donor = await DonorRegister.findOne({ email: email?.toLowerCase() });

    if (!donor) {
        throw new ApiError(404, "Donor profile not found");
    }

    res.status(200).json(
        new ApiResponse(200, donor, "Profile fetched successfully")
    );
});





const editDonorProfile = asyncHandler(async (req, res) => {
    // We get the email from params to identify the donor
    const { email } = req.params; 

    // Destructure allowed fields from req.body
    const {
        fullName,
        phone,
        department,
        presentAddress,
        weight,
        gender,
        privacyMode,
        isAvailable
    } = req.body;

    if (!email) {
        throw new ApiError(400, "Donor email is required for profile update");
    }

    // Prepare the update object
    // Note: We don't manually update donationHistory or lastDonationDate here 
    // as those have their own specific logic controllers.
    const updateData = {
        fullName,
        phone,
        department,
        presentAddress,
        weight,
        gender,
        privacyMode,
        isAvailable
    };

    const updatedDonor = await DonorRegister.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: updateData },
        { 
            returnDocument: 'after', // Fixes Mongoose warning
            runValidators: true      // Ensures enum and min-weight checks are enforced
        }
    );

    if (!updatedDonor) {
        throw new ApiError(404, "Donor profile not found with this email");
    }

    res.status(200).json(
        new ApiResponse(
            200, 
            updatedDonor, 
            "Profile information updated successfully"
        )
    );
});



// donor.controller.js
const getAdminAnalytics = asyncHandler(async (req, res) => {
    // 1. Get core counts
    const totalDonors = await DonorRegister.countDocuments();
    const pendingVerification = await DonorRegister.countDocuments({ status: "pending" }); // Adjust field name to your schema
    
    // 2. Get today's requests (assuming you have a BloodRequest model)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestsToday = await BloodRequest.countDocuments({ createdAt: { $gte: today } });

    // 3. Aggregate Blood Group Distribution
    const bloodGroupDistribution = await DonorRegister.aggregate([
        { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);

    // 4. Monthly/Weekly Growth (Example for the last 7 days)
   // 4. Monthly/Weekly Growth (Corrected Version)
const growthData = await DonorRegister.aggregate([
    {
        $group: {
            // Option 1: Group by full date (YYYY-MM-DD) - Safest and best for charts
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
        }
    },
    { $sort: { "_id": 1 } }, // Sort chronologically
    { $limit: 7 } // Keep last 7 days of data
]);

    res.status(200).json(new ApiResponse(200, {
        totalDonors,
        pendingVerification,
        requestsToday,
        bloodGroupDistribution,
        growthData
    }, "Analytics fetched successfully"));
});




// donor.controller.js
const deleteDonor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const donor = await DonorRegister.findByIdAndDelete(id);

    if (!donor) {
        throw new ApiError(404, "Donor not found");
    }

    // Optional: Delete avatar from Cloudinary if it exists
    // if (donor.avatar) { ... cloudinary delete logic ... }

    res.status(200).json(
        new ApiResponse(200, {}, "Donor removed from the platform successfully")
    );
});










export {
    registerDonor,
    getDonors,
    addDonationHistory,
    getDonationHistory,
    deleteDonationHistory,
    updateDonationHistory,
    editDonorProfile,
    getDonorProfile,
    getAdminAnalytics,
    deleteDonor
};