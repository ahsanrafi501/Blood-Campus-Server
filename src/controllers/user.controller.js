import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { DonorRegister } from "../models/donorRegister.model.js";


const registerUser = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
    } = req.body;

    if (
        [fullName, email].some(field => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const normalizeEmail = email.toLowerCase();

    if (!normalizeEmail.endsWith("@diu.edu.bd")) {
        throw new ApiError(400, "Use your student email")
    }


    try {
        const newUser = await User.create({
            fullName,
            email: normalizeEmail
        });

        res.status(201).json(
            new ApiResponse(201, newUser, "User created successfully")
        );

    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "Email already exists");
        }
        throw new ApiError(500, "someting went wrong");
    }

})



const deleteUserAccount = asyncHandler(async (req, res) => {
    // 🚩 Request body theke email dhoro
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required!");
    }

    // 🔥 Professional Parallel Deletion
    // Ekshathe Donor ar User collection theke delete hobe
    const [donorDeleted, userDeleted] = await Promise.all([
        DonorRegister.findOneAndDelete({ email: email.toLowerCase().trim() }),
        User.findOneAndDelete({ email: email.toLowerCase().trim() })
    ]);

    if (!userDeleted) {
        throw new ApiError(404, "No account found with this email in database.");
    }

    // Professional JSON response
    res.status(200).json({
        success: true,
        message: "User account and associated data purged successfully.",
        data: { donorProfileRemoved: !!donorDeleted }
    });
});




export {
    registerUser,
    deleteUserAccount,
};