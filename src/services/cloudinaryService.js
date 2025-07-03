import { CLOUDINARY_CONFIG } from '../config/cloudinary.js';

// Upload image to Cloudinary
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    try {
        const response = await fetch(
            `${CLOUDINARY_CONFIG.apiUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const result = await response.json();
        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary. Please check your configuration.');
    }
};

// Delete image from Cloudinary (optional)
export const deleteImage = async (publicId) => {
    // Note: This requires server-side implementation with your Cloudinary API key
    // For now, we'll just return a promise that resolves
    console.log('Image deletion would happen here for:', publicId);
    return Promise.resolve();
};

// Delete all images from Cloudinary (admin only)
export const deleteAllImages = async (publicIds, password) => {
    // Replace 'your_admin_password' with your actual password or env variable
    const ADMIN_PASSWORD = import.meta.env.VITE_PASSWORD;
    if (password !== ADMIN_PASSWORD) {
        throw new Error('Invalid password');
    }
    // Simulate deletion (replace with real API call in production)
    const deleted = [];
    for (const publicId of publicIds) {
        // await actualCloudinaryDelete(publicId); // implement this for real deletion
        console.log('Simulated delete for:', publicId);
        deleted.push(publicId);
    }
    return { deletedCount: deleted.length, deleted };
};

// Get Cloudinary configuration
export const getCloudinaryConfig = () => {
    return CLOUDINARY_CONFIG;
}; 