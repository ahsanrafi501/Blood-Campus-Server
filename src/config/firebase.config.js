import admin from "firebase-admin";
import { readFileSync } from "fs";
import path from "path";

// Resolving the path to the JSON file in your root directory
const serviceAccountPath = path.resolve("./blood-campus-d33a5-firebase-adminsdk-fbsvc-f8260e94f7.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;