import { Router } from "express";
import {upload} from "../middlewares/multer.middelware.js"
import { registerDonor } from "../controllers/user.controller.js";

const router = Router();


router.route("/donorRequest").post(
    upload.fields([{name:"avatar", maxCount: 1}]), registerDonor
)

export default router;