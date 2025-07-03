import React from 'react';

const WallMarker = ({ selectedPosition, markerSize = 30, pan = { x: 0, y: 0 }, zoom = 1 }) => {
    if (!selectedPosition) return null;

    // Calculate marker position in wall coordinates, then apply pan and zoom
    const x = selectedPosition.x * zoom + pan.x;
    const y = selectedPosition.y * zoom + pan.y;

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
            }}
        >
            <div className="marker-x">✕</div>
        </div>
    );
};

export default WallMarker;