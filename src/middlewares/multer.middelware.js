import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure the folder exists
const tempDir = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir); // Absolute path
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // You can also add timestamp if you want
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});