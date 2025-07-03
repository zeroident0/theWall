import React from 'react';

const WallMarker = ({ selectedPosition, markerSize = 30 }) => {
    if (!selectedPosition) return null;
    const x = selectedPosition.x;
    const y = selectedPosition.y;
    return (
        <div
            className="position-marker"
            style={{
                position: 'absolute',
                zIndex: 202,
                pointerEvents: 'none',
                left: x - markerSize / 2,
                top: y - markerSize / 2,
                width: markerSize,
                height: markerSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translate(-50%, -50%)`,
            }}
        >
            <div className="marker-x">✕</div>
        </div>
    );
};

export default WallMarker;