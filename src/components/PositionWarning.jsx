import React from 'react';
import './PositionWarning.css';

const PositionWarning = ({ isVisible, onCancel }) => {
    if (!isVisible) return null;

    return (
        <div className="position-warning">
            <div className="warning-content">
                <span className="warning-text">Click where you want to add the image</span>
                <button
                    className="cancel-button"
                    onClick={onCancel}
                    title="Cancel upload"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default PositionWarning; 