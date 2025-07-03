import { useState, useRef, useEffect } from 'react';
import './WallPicture.css';
import ImageModal from './ImageModal';

const WallPicture = ({ image, onPositionChange, onDelete, wallZoom = 1, wallPosition = { x: 0, y: 0 } }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(image.position || { x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 60, height: 60 }); // Fixed default size
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pictureRef = useRef(null);

    useEffect(() => {
        setPosition(image.position || { x: 0, y: 0 });
        console.log('🖼️ WallPicture position updated:', image.position);
    }, [image]);

    const handleMouseDown = (e) => {
        e.stopPropagation();
        // Selection disabled - do nothing
    };

    const handleMouseMove = (e) => {
        // Dragging is disabled - do nothing
    };

    const handleMouseUp = () => {
        // Dragging is disabled - do nothing
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        console.log('🗑️ Delete functionality is disabled');
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        setIsModalOpen(true);
        console.log('🖼️ Opening image modal for:', image.id);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Convert normalized position to pixel position (same as marker logic)
    const pixelX = 600 + position.x * 1200; // 1200px wall width, center at 600
    const pixelY = window.innerHeight / 2 + position.y * window.innerHeight; // Wall height, center at half height

    return (
        <>
            <div
                ref={pictureRef}
                className="wall-picture"
                style={{
                    left: pixelX - size.width / 2,
                    top: pixelY - size.height / 2,
                    width: size.width,
                    height: size.height,
                    cursor: 'pointer',
                    position: 'absolute',
                    zIndex: 100,
                    transformOrigin: 'center',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                }}
                onMouseDown={handleMouseDown}
            >
                <img
                    src={image.url}
                    alt="Picture on wall"
                    draggable={false}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                    onClick={handleImageClick}
                    onLoad={e => {
                        // Calculate scaled size while maintaining aspect ratio
                        const { naturalWidth, naturalHeight } = e.target;
                        const maxSize = 60; // Fixed target size

                        let scaledWidth, scaledHeight;
                        if (naturalWidth > naturalHeight) {
                            // Landscape image
                            scaledWidth = maxSize;
                            scaledHeight = (naturalHeight / naturalWidth) * maxSize;
                        } else {
                            // Portrait or square image
                            scaledHeight = maxSize;
                            scaledWidth = (naturalWidth / naturalHeight) * maxSize;
                        }

                        setSize({ width: scaledWidth, height: scaledHeight });
                        setImageLoaded(true);
                    }}
                />
                <div className="hover-icon">🔍</div>
            </div>

            <ImageModal
                image={image}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default WallPicture;