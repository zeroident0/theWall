import React from 'react';
import './PictureCounter.css';

const PictureCounter = ({ count }) => (
    <div className="picture-counter">
        <span>{count} picture{count !== 1 ? 's' : ''} on the wall</span>
    </div>
);

export default PictureCounter; 