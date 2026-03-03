import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { DonorRegister } from "../models/donorRegister.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerDonor = asyncHandler(async (req, res) => {
    //get donar details from frontend
    //validation - not empty
    //check user already a doner
    //check for avater
    //create user object - create entry in db
    //check for donner submit
    //return response

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
            "User with this email, student Id or phone number is already exists"
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
    });

    const createdDonor = await DonorRegister.findById(donor._id);

    if (!createdDonor) {
        throw new ApiError(500, "Something went wrong.");
    }

    res.status(201).json(
        new ApiResponse(201, createdDonor, "donor requested successfully")
    );
});

export { registerDonor };