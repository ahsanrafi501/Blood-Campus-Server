import { Router } from "express";
import { deleteUserAccount, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/user-register").post(registerUser)

router.route("/delete-account").post(verifyJWT, deleteUserAccount);

export default router;