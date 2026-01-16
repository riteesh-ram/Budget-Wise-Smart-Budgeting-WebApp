import {API_ENDPOINTS} from "./apiEndpoints.js";

// Use environment override when available; fall back to Cloudinary's default unsigned preset.
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

const uploadProfileImage = async (image) => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        console.log('Image uploaded successfully.', data);
        return data.secure_url;
    } catch (error) {
        console.error("Error uploading the image", error);
        throw error;
    }
}

export default uploadProfileImage;