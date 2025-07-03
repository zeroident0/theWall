import React, { useEffect, useState } from 'react';
import { toggleLike, subscribeToImageLikes, hasUserLikedImage } from '../services/likeService';
import './ImageModal.css';

const ImageModal = ({ image, isOpen, onClose }) => {
    const [likes, setLikes] = useState([]);
    const [userLiked, setUserLiked] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Subscribe to likes when modal opens
    useEffect(() => {
        if (!isOpen || !image) return;

        // Check if user has liked this image
        const checkUserLike = async () => {
            try {
                const hasLiked = await hasUserLikedImage(image.id);
                setUserLiked(hasLiked);
            } catch (error) {
                console.error('Error checking user like status:', error);
            }
        };

        checkUserLike();

        // Subscribe to real-time like updates
        const unsubscribe = subscribeToImageLikes(image.id, (likesData) => {
            setLikes(likesData);
        });

        return () => unsubscribe();
    }, [isOpen, image]);

    if (!isOpen || !image) return null;

    const formatUploadDate = (uploadedAt) => {
        if (!uploadedAt) return 'Unknown';

        const date = new Date(uploadedAt);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    const formatFullDate = (uploadedAt) => {
        if (!uploadedAt) return 'Unknown';

        const date = new Date(uploadedAt);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleLikeClick = async () => {
        if (isLiking) return;

        setIsLiking(true);
        try {
            const result = await toggleLike(image.id);
            setUserLiked(result.liked);
            console.log(`❤️ Image ${result.action}`);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="image-modal-close" onClick={onClose}>
                    ×
                </button>

                <div className="image-modal-image-container">
                    <img
                        src={image.url}
                        alt="Fullscreen view"
                        className="image-modal-image"
                        draggable={false}
                    />
                </div>

                <div className="image-modal-info">
                    <div className="image-modal-info-item">
                        <span className="info-label">Full Date:</span>
                        <span className="info-value">{formatFullDate(image.uploadedAt)}</span>
                    </div>
                    <div className="image-modal-info-item like-section">
                        <button
                            className={`like-button ${userLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
                            onClick={handleLikeClick}
                            disabled={isLiking}
                        >
                            <span className="like-icon">{userLiked ? '❤️' : '🤍'}</span>
                            <span className="like-count">{likes.length}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageModal; 