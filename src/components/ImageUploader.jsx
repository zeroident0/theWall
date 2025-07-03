import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { uploadImage } from '../services/cloudinaryService';
import { canUserUpload } from '../services/limitService';
import './ImageUploader.css';

const ImageUploader = forwardRef(({ onImageUploaded, onPositionSelectMode }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isPositionSelectMode, setIsPositionSelectMode] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null); // Store selected position
    const [canUpload, setCanUpload] = useState(true);
    const [uploadLimit, setUploadLimit] = useState({ uploadCount: 0, remaining: 3 });
    const fileInputRef = useRef(null);

    // Check upload limit on component mount and when needed
    useEffect(() => {
        const checkLimit = async () => {
            try {
                const limit = await canUserUpload();
                setCanUpload(limit.canUpload);
                setUploadLimit({ uploadCount: limit.uploadCount, remaining: limit.remaining });
            } catch (error) {
                console.error('Error checking upload limit:', error);
                setCanUpload(true);
            }
        };

        checkLimit();
    }, []);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        selectImageFile: (position) => {
            console.log('🎯 Position selected:', position);
            if (isPositionSelectMode && canUpload) {
                // Store the selected position
                setSelectedPosition(position);
                // Trigger file selection
                fileInputRef.current?.click();
            }
        },
        resetState: () => {
            setIsPositionSelectMode(false);
            setSelectedPosition(null);
            setIsUploading(false);
            setUploadProgress(0);
            setIsDragging(false);
            console.log('🔄 ImageUploader state reset');
        },
        refreshLimit: async () => {
            try {
                const limit = await canUserUpload();
                setCanUpload(limit.canUpload);
                setUploadLimit({ uploadCount: limit.uploadCount, remaining: limit.remaining });
            } catch (error) {
                console.error('Error refreshing upload limit:', error);
            }
        }
    }));

    const handleDragOver = (e) => {
        e.preventDefault();
        if (canUpload) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (!canUpload) {
            alert('Daily upload limit reached. You can upload 3 more pictures tomorrow.');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length > 0) {
            // Use selected position or default to center
            const position = selectedPosition || { x: 0, y: 0 };
            handleFileUpload(imageFiles[0], position);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (!canUpload) {
                alert('Daily upload limit reached. You can upload 3 more pictures tomorrow.');
                e.target.value = '';
                return;
            }

            // Use the stored selected position
            const position = selectedPosition || { x: 0, y: 0 };
            console.log('📁 File selected, using position:', position);
            handleFileUpload(files[0], position);
        }
        // Clear the file input
        e.target.value = '';
    };

    const handleUploaderClick = () => {
        if (!canUpload) {
            alert('Daily upload limit reached. You can upload 3 more pictures tomorrow.');
            return;
        }

        if (!isPositionSelectMode) {
            // Enter position selection mode
            setIsPositionSelectMode(true);
            setSelectedPosition(null); // Clear previous selection
            onPositionSelectMode && onPositionSelectMode(true);
            console.log('🎯 Entering position selection mode');
        } else {
            // Exit position selection mode
            setIsPositionSelectMode(false);
            setSelectedPosition(null);
            onPositionSelectMode && onPositionSelectMode(false);
            console.log('❌ Exiting position selection mode');
        }
    };

    const simulateProgress = () => {
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 200);
        return interval;
    };

    const handleFileUpload = async (file, position) => {
        if (!file) return;

        console.log('🚀 Starting upload with position:', position);

        setIsUploading(true);
        setUploadProgress(0);

        // Start progress simulation
        const progressInterval = simulateProgress();

        try {
            const result = await uploadImage(file);

            // Complete progress
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Create image object with the selected position
            const newImage = {
                id: Date.now().toString(),
                url: result.url,
                publicId: result.publicId,
                position: position, // Use the passed position
                size: { width: result.width, height: result.height },
                uploadedAt: new Date().toISOString()
            };

            // Console log successful upload with position
            console.log('✅ Image upload successful!', {
                id: newImage.id,
                url: newImage.url,
                position: newImage.position,
                size: newImage.size,
                uploadedAt: newImage.uploadedAt
            });
            console.log(`📍 Final position: x=${newImage.position.x.toFixed(2)}, y=${newImage.position.y.toFixed(2)}`);

            onImageUploaded(newImage);

            // Reset states
            setSelectedPosition(null);
            setIsPositionSelectMode(false);
            onPositionSelectMode && onPositionSelectMode(false);

            // Refresh upload limit after successful upload
            setTimeout(async () => {
                try {
                    const limit = await canUserUpload();
                    setCanUpload(limit.canUpload);
                    setUploadLimit({ uploadCount: limit.uploadCount, remaining: limit.remaining });
                } catch (error) {
                    console.error('Error refreshing upload limit:', error);
                }
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);

            // Check if it's a limit error
            if (error.message && error.message.includes('Daily upload limit reached')) {
                alert(error.message);
                // Refresh the limit display
                try {
                    const limit = await canUserUpload();
                    setCanUpload(limit.canUpload);
                    setUploadLimit({ uploadCount: limit.uploadCount, remaining: limit.remaining });
                } catch (limitError) {
                    console.error('Error refreshing upload limit:', limitError);
                }
            } else {
                alert('Failed to upload image. Please check your Cloudinary configuration.');
            }
        } finally {
            clearInterval(progressInterval);
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="image-uploader">
            {/* Plus button at top right */}
            {!isPositionSelectMode && !isUploading && (
                <button
                    className={`upload-plus-btn ${!canUpload ? 'disabled' : ''}`}
                    onClick={handleUploaderClick}
                    title={canUpload ? "Add image to wall" : "Daily upload limit reached. You can upload 3 more pictures tomorrow."}
                    type="button"
                >
                    +
                </button>
            )}
            {/* Upload area only shown for drag/drop or uploading (not for position select mode) */}
            {(isDragging || isUploading) && (
                <div
                    className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p>Uploading... {Math.round(uploadProgress)}%</p>
                        </div>
                    ) : null}
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />
        </div>
    );
});

export default ImageUploader;