import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom';
import './App.css'
import ImageUploader from './components/ImageUploader'
import WallPicture from './components/WallPicture'
import { loadPictures, addPicture, updatePicturePosition, deletePicture } from './services/storageService'
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

  // Load saved pictures on component mount
  useEffect(() => {
    const savedPictures = loadPictures();
    setPictures(savedPictures);
  }, []);

  const handleWheel = (e) => {
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

  const handleImageUploaded = (newImage) => {
    setPendingImage(newImage);
    const updatedPictures = addPicture(newImage);
    setPictures(updatedPictures);
    setSelectedPictureId(newImage.id);
    setSelectedPosition(null);
  };

  useEffect(() => {
    if (pendingImage && pictures.some(p => p.id === pendingImage.id)) {
      setPendingImage(null);
    }
  }, [pictures, pendingImage]);

  const handlePositionChange = (pictureId, newPosition) => {
    const updatedPictures = updatePicturePosition(pictureId, newPosition);
    setPictures(updatedPictures);
  };

  const handleDeletePicture = (pictureId) => {
    const updatedPictures = deletePicture(pictureId);
    setPictures(updatedPictures);
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
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
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
    if (!isActive) {
      setSelectedPosition(null);
    }
  };

  // Apply transform to the wall, not the app
  const wallStyle = {
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: 'center',
    transition: dragging.current ? 'none' : 'transform 0.2s',
    cursor: dragging.current ? 'grabbing' : 'grab',
  };

  return (
    <div
      className="app"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      {/* Wall Background with Pictures as Children */}
      <TheWall onClick={handleBackgroundClick} style={wallStyle}>
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
          let screenX = pendingImage.position.x;
          let screenY = pendingImage.position.y;
          const imgSize = 100; // preview size
          return (
            <img
              src={pendingImage.url}
              alt="Uploading..."
              style={{
                left: screenX - imgSize / 2,
                top: screenY - imgSize / 2,
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
        <WallMarker selectedPosition={selectedPosition} />
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

export default App
