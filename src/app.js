import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


import userRegisterRoute from "./routes/user.route.js";
import donorRegisterRoute from "./routes/donor.route.js";
<<<<<<< HEAD
import { addDonationHistory, deleteDonationHistory, deleteDonor, editDonorProfile, getAdminAnalytics, getDonationHistory, getDonorProfile, getDonors, updateDonationHistory } from './controllers/donor.controller.js';
=======
import { addDonationHistory, deleteDonationHistory, editDonorProfile, getDonationHistory, getDonorProfile, getDonors, updateDonationHistory } from './controllers/donor.controller.js';
>>>>>>> 1d49b5e066faf456aa8af0ccc4b4c84dd3e58111

const app = express();

// 2. Middlewares
app.use(cors({
    origin: true, 
    credentials: true,
}));
<<<<<<< HEAD

app.use(express.json({ limit: "16kb" })); 
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//user routes
app.use("/api/v1/user", userRegisterRoute);
app.get("/api/v1/users", userRegisterRoute);

=======

app.use(express.json({ limit: "16kb" })); 
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//user routes
app.use("/api/v1/user", userRegisterRoute);
app.get("/api/v1/users", userRegisterRoute);

>>>>>>> 1d49b5e066faf456aa8af0ccc4b4c84dd3e58111
// Donor routes
app.use("/api/v1/donor", donorRegisterRoute);
app.get("/api/v1/donors", getDonors);
app.post("/api/v1/donors", addDonationHistory)
app.post("/api/v1/donors", getDonationHistory)
app.post("/api/v1/donors", updateDonationHistory)
app.post("/api/v1/donors", deleteDonationHistory)
app.get("/api/v1/donors", getDonorProfile)
app.post("/api/v1/donors", editDonorProfile)
<<<<<<< HEAD
app.get("/api/v1/donors", getAdminAnalytics)
app.get("/api/v1/donors", deleteDonor)
=======

>>>>>>> 1d49b5e066faf456aa8af0ccc4b4c84dd3e58111


export { app };