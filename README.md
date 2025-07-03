# The Wall - Interactive Picture Gallery

An interactive web application that allows you to hang pictures on a virtual wall. Upload images to Cloudinary and position them anywhere on the wall background.

## Features

- 🖼️ **Image Upload**: Drag & drop or click to upload images to Cloudinary
- 🎯 **Drag & Drop**: Position pictures anywhere on the wall
- 💾 **Persistent Storage**: Picture positions are saved locally
- 🖱️ **Interactive**: Select, move, and delete pictures
- 📱 **Responsive**: Works on desktop and mobile devices
- 🖼️ **Realistic Frames**: Pictures appear with wooden frames and shadows

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd theWall
npm install
```

### 2. Configure Cloudinary

1. **Sign up for Cloudinary**:
   - Go to [https://cloudinary.com/](https://cloudinary.com/)
   - Create a free account

2. **Get your Cloud Name**:
   - From your Cloudinary dashboard, copy your Cloud Name

3. **Create an Upload Preset**:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing mode" to "Unsigned"
   - Save the preset name

4. **Update Configuration**:
   - Open `src/config/cloudinary.js`
   - Replace `YOUR_CLOUD_NAME` with your actual Cloud Name
   - Replace `thewall_preset` with your upload preset name

Example:
```javascript
export const CLOUDINARY_CONFIG = {
    cloudName: 'my-awesome-cloud',
    uploadPreset: 'thewall_pictures',
    apiUrl: 'https://api.cloudinary.com/v1_1'
};
```

### 3. Run the Application

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually `http://localhost:5173`).

## How to Use

1. **Upload Pictures**: Use the upload area in the top-right corner
   - Drag & drop an image file
   - Or click to select a file from your computer

2. **Position Pictures**: 
   - Click and drag any picture to move it around the wall
   - Pictures automatically get realistic wooden frames

3. **Manage Pictures**:
   - Click on a picture to select it (shows blue border)
   - Click the × button to delete a selected picture
   - Click on empty space to deselect

4. **Navigate the Wall**:
   - Drag the wall background to pan around
   - Use mouse wheel or pinch gestures to zoom in/out

## File Structure

```
src/
├── components/
│   ├── DraggableImage.jsx    # Wall background with pan/zoom
│   ├── ImageUploader.jsx     # Image upload interface
│   ├── WallPicture.jsx       # Individual picture component
│   └── *.css                 # Component styles
├── services/
│   ├── cloudinaryService.js  # Cloudinary upload logic
│   └── storageService.js     # Local storage management
├── config/
│   └── cloudinary.js         # Cloudinary configuration
└── App.jsx                   # Main application component
```

## Technologies Used

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Cloudinary** - Image hosting and CDN
- **LocalStorage** - Client-side data persistence
- **CSS3** - Styling with modern features

## Customization

### Changing the Wall Background
Replace the image at `src/assets/thewall.png` with your own wall texture.

### Adjusting Picture Sizes
Modify the `maxSize` variable in `WallPicture.jsx` to change the default picture size.

### Styling Frames
Edit the CSS in `WallPicture.css` to customize the picture frame appearance.

## Troubleshooting

### Upload Issues
- Ensure your Cloudinary configuration is correct
- Check that your upload preset is set to "Unsigned"
- Verify your Cloud Name is correct

### Performance Issues
- Large images are automatically resized by Cloudinary
- Consider optimizing images before upload for better performance

## License

This project is open source and available under the MIT License.
# theWall
