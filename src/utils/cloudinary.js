import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
        console.error("File not found:", localFilePath);
        return null;
    }

    try {
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        try { fs.unlinkSync(localFilePath); } catch(e) { console.error(e); }
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        try { fs.unlinkSync(localFilePath); } catch(e) { console.error(e); }
        return null;
    }
}

export { uploadOnCloudinary };