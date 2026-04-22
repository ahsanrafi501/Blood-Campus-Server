import { Router } from "express";
import { 
    registerDonor, 
    getDonors, 
    addDonationHistory, 
    getDonationHistory,
    updateDonationHistory, // Added
    deleteDonationHistory,  // Added
    editDonorProfile,
    getDonorProfile,
    getAdminAnalytics,
    deleteDonor
} from "../controllers/donor.controller.js";
import { upload } from "../middlewares/multer.middelware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

// 1. Donor Request/Registration (With Avatar Upload)
router.route("/donorRequest").post(
    upload.fields([
        { name: "avatar", maxCount: 1 }
    ]), 
    registerDonor
);

// 2. Find Donors (Public Search)
router.route("/find-donor").get(getDonors);

// 3. Add Donation History
router.route("/add-history").post(addDonationHistory);

// 4. Get Donation History (Fetch by email)
router.route("/history/:email").get(getDonationHistory);

// 5. Update Specific Donation History (Using History ID)
router.route("/update-history/:historyId").patch(updateDonationHistory);

// 6. Delete Specific Donation History (Using History ID)
router.route("/delete-history/:historyId").delete(deleteDonationHistory);

// 6. Edit Donor donor profile (Using History ID)
router.route("/get-profile/:email").get(getDonorProfile);

// 6. Edit Donor donor profile (Using History ID)
router.route("/update-profile/:email").patch(editDonorProfile);

// 6. get admin analytics
router.route("/admin-analytics").get(getAdminAnalytics);

// 6. Delete Donor
router.route("/delete-donor/:id").delete(deleteDonor);

export default router;