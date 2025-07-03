// Cloudinary Configuration
// 
// To set up Cloudinary for this app:
// 1. Sign up at https://cloudinary.com/
// 2. Get your Cloud Name from your dashboard
// 3. Create an upload preset:
//    - Go to Settings > Upload
//    - Scroll to Upload presets
//    - Click "Add upload preset"
//    - Set signing mode to "Unsigned"
//    - Save the preset name
// 4. Create a .env file in the root directory with the following variables:
//    VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
//    VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
//    VITE_CLOUDINARY_API_URL=https://api.cloudinary.com/v1_1

export const CLOUDINARY_CONFIG = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiUrl: import.meta.env.VITE_CLOUDINARY_API_URL || 'https://api.cloudinary.com/v1_1'
};

// Example .env file content:
// VITE_CLOUDINARY_CLOUD_NAME=my-awesome-cloud
// VITE_CLOUDINARY_UPLOAD_PRESET=thewall_pictures
// VITE_CLOUDINARY_API_URL=https://api.cloudinary.com/v1_1

// Example configuration:
// export const CLOUDINARY_CONFIG = {
//     cloudName: 'my-awesome-cloud',
//     uploadPreset: 'thewall_pictures',
//     apiUrl: 'https://api.cloudinary.com/v1_1'
// }; 