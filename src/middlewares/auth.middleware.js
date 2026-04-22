import admin from "../config/firebase.config.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    // 1. Extract token from Authorization Header (Bearer <token>)
    const token = req.headers.authorization?.split("Bearer ")[1];
    
    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        // 2. Verify the token with Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        if (!decodedToken) {
            throw new ApiError(401, "Invalid access token");
        }

        // 3. Attach user data to the request object
        req.user = decodedToken;
        
        next();
    } catch (error) {
        // This will trigger the 401/403 interceptor on your frontend
        throw new ApiError(401, error?.message || "Token expired or invalid");
    }
});