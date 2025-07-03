import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';
import './App.css'
import ImageUploader from './components/ImageUploader'
import WallPicture from './components/WallPicture'
import { loadPictures, addPicture, updatePicturePosition, deletePicture, deleteAllImagesAndClear, subscribeToPictures } from './services/storageService'
import TheWall from './components/theWall'
import WallMarker from './components/WallMarker'
import ImageUploadUI from './components/ImageUploadUI';
import PictureCounter from './components/PictureCounter';
import PositionWarning from './components/PositionWarning';
import UploadLimitDisplay from './components/UploadLimitDisplay';
import { toggleInfinityMode, getUserUploadStats } from './services/limitService';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

function App() {
  const [pictures, setPictures] = useState([]);
  const [selectedPictureId, setSelectedPictureId] = useState(null);
  const [isPositionSelectMode, setIsPositionSelectMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const imageUploaderRef = useRef(null);
  const [pendingImage, setPendingImage] = useState(null);
  const appRef = useRef(null);
  const wallRef = useRef(null);
  const [wallSize, setWallSize] = useState({ width: 1200, height: window.innerHeight });

  useEffect(() => {
    // Update wall size on mount and resize
    function updateWallSize() {
      if (wallRef.current) {
        const rect = wallRef.current.getBoundingClientRect();
        setWallSize({ width: rect.width, height: rect.height });
      }
    }
    updateWallSize();
    window.addEventListener('resize', updateWallSize);
    return () => window.removeEventListener('resize', updateWallSize);
  }, []);

  // Load saved pictures on component mount
  useEffect(() => {
    // Expose admin deleteAllImages command for console use
    window.deleteAllImages = async (password) => {
      try {
        const result = await deleteAllImagesAndClear(password);
        console.log('All images deleted:', result);
      } catch (err) {
        console.error('Failed to delete all images:', err);
      }
    };

    // Expose infinity mode functions for debugging
    window.enableInfinityUploads = (password) => {
      const success = toggleInfinityMode(password);
      if (success) {
        console.log('🔓 Infinity uploads enabled! Refresh the page to see changes.');
        // Force refresh to update UI
        window.location.reload();
      } else {
        console.log('❌ Invalid password for infinity mode');
      }
      return success;
    };

    window.disableInfinityUploads = () => {
      sessionStorage.removeItem('infinityMode');
      console.log('🔒 Infinity uploads disabled! Refresh the page to see changes.');
      window.location.reload();
    };

    window.getUploadStats = async () => {
      const stats = await getUserUploadStats();
      console.log('📊 Current upload stats:', stats);
      return stats;
    };

    // Usage examples:
    console.log('🔧 Debug commands available:');
    console.log('  window.enableInfinityUploads("your_password") - Enable infinite uploads');
    console.log('  window.disableInfinityUploads() - Disable infinite uploads');
    console.log('  window.getUploadStats() - Get current upload statistics');
    console.log('  window.deleteAllImages("admin_password") - Delete all images');

    // Usage: window.deleteAllImages('your_admin_password')
    const unsubscribe = subscribeToPictures(setPictures);
    return () => unsubscribe();
  }, []);

  const handleImageUploaded = async (newImage) => {
    try {
      setPendingImage(newImage);
      await addPicture(newImage);
      setSelectedPictureId(newImage.id);
      setSelectedPosition(null);

      // Refresh the upload limit display
      if (imageUploaderRef.current && imageUploaderRef.current.refreshLimit) {
        imageUploaderRef.current.refreshLimit();
      }
    } catch (error) {
      console.error('Error adding picture:', error);
      setPendingImage(null);

      // If it's a limit error, show the message
      if (error.message && error.message.includes('Daily upload limit reached')) {
        alert(error.message);
      } else {
        alert('Failed to add picture to the wall. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (pendingImage && pictures.some(p => p.id === pendingImage.id)) {
      setPendingImage(null);
    }
  }, [pictures, pendingImage]);

  const handlePositionChange = async (pictureId, newPosition) => {
    await updatePicturePosition(pictureId, newPosition);
  };

  const handleDeletePicture = async (pictureId) => {
    await deletePicture(pictureId);
    if (selectedPictureId === pictureId) {
      setSelectedPictureId(null);
    }
  };

  const handleSelectPicture = (pictureId) => {
    setSelectedPictureId(pictureId);
  };

  const handleBackgroundClick = (e) => {
    if (isPositionSelectMode) {
      // Calculate the correct position on the wall
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      const calculatedPosition = { x, y };
      setSelectedPosition(calculatedPosition);
      if (imageUploaderRef.current && imageUploaderRef.current.selectImageFile) {
        imageUploaderRef.current.selectImageFile(calculatedPosition);
      }
    } else {
      setSelectedPictureId(null);
    }
  };

  const handlePositionSelectMode = (isActive) => {
    setIsPositionSelectMode(isActive);
    if (isActive) {
      setSelectedPosition(null);
    }
  };

  // Convert normalized position to pixel position for marker
  let markerPixelPosition = null;
  if (selectedPosition && wallSize) {
    markerPixelPosition = {
      x: 600 + selectedPosition.x * 1200, // 1200px wall width, center at 600
      y: window.innerHeight / 2 + selectedPosition.y * window.innerHeight, // Wall height, center at half height
    };
  }

  // Remove transform from appStyle
  const appStyle = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    cursor: isPositionSelectMode ? 'crosshair' : 'default',
  };

  return (
    <div
      ref={appRef}
      className="app"
      style={appStyle}
    >
      {/* Wall Background with Pictures as Children */}
      <TheWall
        ref={wallRef}
        onClick={handleBackgroundClick}
      >
        {pictures.map((picture) => (
          <WallPicture
            key={picture.id}
            image={picture}
            onPositionChange={handlePositionChange}
            onDelete={handleDeletePicture}
            isSelected={selectedPictureId === picture.id}
            onSelect={handleSelectPicture}
          />
        ))}
        {/* Pending Image Preview at Marker */}
        {pendingImage && selectedPosition && (() => {
          // Convert normalized position to pixel position (same logic as marker)
          const imgSize = 60; // preview size
          const pixelX = 600 + selectedPosition.x * 1200; // 1200px wall width, center at 600
          const pixelY = window.innerHeight / 2 + selectedPosition.y * window.innerHeight; // Wall height, center at half height
          return (
            <img
              src={pendingImage.url}
              alt="Uploading..."
              style={{
                left: pixelX - imgSize / 2,
                top: pixelY - imgSize / 2,
                position: 'absolute',
                zIndex: 201,
                width: imgSize,
                height: imgSize,
                opacity: 0.7,
                pointerEvents: 'none',
                border: '2px dashed #888',
                background: '#fff',
                borderRadius: 8
              }}
            />
          );
        })()}
        {/* Position Marker as a wall child */}
        <WallMarker selectedPosition={markerPixelPosition} />
      </TheWall>
      {/* Portals for UI overlays */}
      {createPortal(
        <ImageUploadUI
          ref={imageUploaderRef}
          onImageUploaded={handleImageUploaded}
          onPositionSelectMode={handlePositionSelectMode}
        />,
        document.body
      )}
      {createPortal(
        <UploadLimitDisplay />, document.body
      )}
      {createPortal(
        <PictureCounter count={pictures.length} />, document.body
      )}
      {createPortal(
        <PositionWarning
          isVisible={isPositionSelectMode}
          onCancel={() => {
            handlePositionSelectMode(false);
            // Reset the ImageUploader state to show the upload button again
            if (imageUploaderRef.current && imageUploaderRef.current.resetState) {
              imageUploaderRef.current.resetState();
            }
          }}
        />,
        document.body
      )}
    </div>
  )
}

export default App;