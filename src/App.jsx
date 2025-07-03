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

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

function App() {
  const [pictures, setPictures] = useState([]);
  const [selectedPictureId, setSelectedPictureId] = useState(null);
  const [isPositionSelectMode, setIsPositionSelectMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const imageUploaderRef = useRef(null);
  const [pendingImage, setPendingImage] = useState(null);
  const appRef = useRef(null);
  const lastTouch = useRef({ x: 0, y: 0 });
  const lastTouchDistance = useRef(null);
  const lastTouchMidpoint = useRef(null);

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
    // Usage: window.deleteAllImages('your_admin_password')
    const unsubscribe = subscribeToPictures(setPictures);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const appElem = appRef.current;
    if (!appElem) return;
    const handleWheelWrapper = (e) => handleWheel(e);
    appElem.addEventListener('wheel', handleWheelWrapper, { passive: false });
    return () => {
      appElem.removeEventListener('wheel', handleWheelWrapper);
    };
  }, [zoom, pan, isPositionSelectMode]);

  const handleWheel = (e) => {
    if (isPositionSelectMode) return; // Disable zooming in position select mode
    e.preventDefault();
    let newZoom = zoom - e.deltaY * 0.001;
    newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    if (newZoom === zoom) return;
    // Zoom to mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - (rect.left + rect.width / 2) - pan.x;
    const mouseY = e.clientY - (rect.top + rect.height / 2) - pan.y;
    const scale = newZoom / zoom;
    setPan(prev => ({
      x: prev.x - mouseX * (scale - 1),
      y: prev.y - mouseY * (scale - 1)
    }));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    // Allow panning even in position select mode
    if (e.button !== 0) return;
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan(prev => limitPan({ x: prev.x + dx, y: prev.y + dy }));
  };
  const handleMouseUp = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const limitPan = (pan) => {
    // Limit panning so the app cannot be dragged beyond its edges
    // For simplicity, allow free panning, or you can add limits based on content size
    return pan;
  };

  const handleImageUploaded = async (newImage) => {
    setPendingImage(newImage);
    await addPicture(newImage);
    setSelectedPictureId(newImage.id);
    setSelectedPosition(null);
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
      const x = (e.clientX - centerX - pan.x) / zoom + rect.width / 2;
      const y = (e.clientY - centerY - pan.y) / zoom + rect.height / 2;
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
      setZoom(1); // Force zoom to 1
      setPan({ x: 0, y: 0 }); // Center the wall
    } else {
      setSelectedPosition(null);
    }
  };

  // Touch event handlers for mobile panning and pinch-zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single finger: start panning
      dragging.current = true;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Two fingers: start pinch-zoom
      lastTouchDistance.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchMidpoint.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && dragging.current) {
      // Single finger: panning
      const dx = e.touches[0].clientX - lastTouch.current.x;
      const dy = e.touches[0].clientY - lastTouch.current.y;
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setPan(prev => limitPan({ x: prev.x + dx, y: prev.y + dy }));
      e.preventDefault();
    } else if (e.touches.length === 2) {
      // Two fingers: pinch-zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const midpoint = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      if (lastTouchDistance.current) {
        let scale = dist / lastTouchDistance.current;
        let newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * scale));
        // Adjust pan so zoom centers on pinch midpoint
        const rect = appRef.current.getBoundingClientRect();
        const mouseX = midpoint.x - (rect.left + rect.width / 2) - pan.x;
        const mouseY = midpoint.y - (rect.top + rect.height / 2) - pan.y;
        const zoomScale = newZoom / zoom;
        setPan(prev => ({
          x: prev.x - mouseX * (zoomScale - 1),
          y: prev.y - mouseY * (zoomScale - 1)
        }));
        setZoom(newZoom);
      }
      lastTouchDistance.current = dist;
      lastTouchMidpoint.current = midpoint;
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      dragging.current = false;
      lastTouchDistance.current = null;
      lastTouchMidpoint.current = null;
    } else if (e.touches.length === 1) {
      // If one finger remains, start panning from its position
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchDistance.current = null;
      lastTouchMidpoint.current = null;
    }
  };

  // Apply transform to the entire app
  const appStyle = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center',
    transition: dragging.current ? 'none' : 'transform 0.2s',
    cursor: dragging.current ? 'grabbing' : 'grab',
  };

  useEffect(() => {
    const appElem = appRef.current;
    if (!appElem) return;
    // Attach touch event listeners with passive: false
    appElem.addEventListener('touchstart', handleTouchStart, { passive: false });
    appElem.addEventListener('touchmove', handleTouchMove, { passive: false });
    appElem.addEventListener('touchend', handleTouchEnd, { passive: false });
    appElem.addEventListener('touchcancel', handleTouchEnd, { passive: false });
    return () => {
      appElem.removeEventListener('touchstart', handleTouchStart);
      appElem.removeEventListener('touchmove', handleTouchMove);
      appElem.removeEventListener('touchend', handleTouchEnd);
      appElem.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [zoom, pan, isPositionSelectMode]);

  return (
    <div
      ref={appRef}
      className="app"
      style={appStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Wall Background with Pictures as Children */}
      <TheWall onClick={handleBackgroundClick}>
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
        {pendingImage && pendingImage.position && (() => {
          let screenX = 0;
          let screenY = 0;
          const imgSize = 100; // preview size
          const viewportCenterX = window.innerWidth / 2;
          const viewportCenterY = window.innerHeight / 2;
          screenX = viewportCenterX + pan.x + pendingImage.position.x * zoom;
          screenY = viewportCenterY + pan.y + pendingImage.position.y * zoom;
          return (
            <img
              src={pendingImage.url}
              alt="Uploading..."
              style={{
                left: screenX - imgSize / 2,
                top: screenY - imgSize / 2,
                position: 'fixed',
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
        <WallMarker selectedPosition={selectedPosition} pan={pan} zoom={zoom} />
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
        <PictureCounter count={pictures.length} />, document.body
      )}
    </div>
  )
}

export default App;