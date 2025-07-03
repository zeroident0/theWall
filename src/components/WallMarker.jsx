import React from 'react';

const WallMarker = ({ selectedPosition, markerSize = 30 }) => {
    if (!selectedPosition) return null;

    // Use wall coordinates directly
    const screenX = selectedPosition.x;
    const screenY = selectedPosition.y;

    return (
        <div
            className="position-marker"
            style={{
                position: 'absolute',
                zIndex: 202,
                pointerEvents: 'none',
                left: screenX - markerSize / 2,
                top: screenY - markerSize / 2,
                width: markerSize,
                height: markerSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div className="marker-x">✕</div>
        </div>
    );
};

export default WallMarker;