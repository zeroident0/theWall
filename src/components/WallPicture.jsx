import { useState, useRef, useEffect } from 'react';
import './WallPicture.css';

const WallPicture = ({ image, onPositionChange, onDelete, wallZoom = 1, wallPosition = { x: 0, y: 0 } }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState(image.position || { x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 100, height: 100 });
    const [imageLoaded, setImageLoaded] = useState(false);
    const pictureRef = useRef(null);

    useEffect(() => {
        setPosition(image.position || { x: 0, y: 0 });
        console.log('🖼️ WallPicture position updated:', image.position);
    }, [image]);

    // Ensure image is centered on the mark after it loads (when size is known)
    useEffect(() => {
        if (pictureRef.current && image.position && imageLoaded) {
            // Force a re-render by updating state if needed
            setPosition(image.position);
        }
    }, [size.width, size.height, image.position, imageLoaded]);

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

    const handleImageLoad = (e) => {
        // No dynamic sizing; use fixed size
    };

    // Calculate the actual position on the wall
    // The wall's center is at (0,0) in wall coordinates
    // We need to position relative to the wall's center
    const wallCenterX = 0; // Wall coordinate system center
    const wallCenterY = 0; // Wall coordinate system center

    // Position relative to wall center, adjusted for picture size
    const actualLeft = wallCenterX + position.x - size.width / 2;
    const actualTop = wallCenterY + position.y - size.height / 2;

    return (
        <div
            ref={pictureRef}
            className="wall-picture"
            style={{
                left: actualLeft,
                top: actualTop,
                width: size.width,
                height: size.height,
                cursor: 'default',
                position: 'absolute',
                zIndex: 100,
                // Add transform-origin center so the picture centers on the clicked point
                transformOrigin: 'center',
                // Prevent text selection and blue highlight
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
                    // Prevent text selection on image as well
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                }}
                onLoad={e => {
                    // Calculate scaled size while maintaining aspect ratio
                    const { naturalWidth, naturalHeight } = e.target;
                    const maxSize = 100; // Target size

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
        </div>
    );
};

export default WallPicture;