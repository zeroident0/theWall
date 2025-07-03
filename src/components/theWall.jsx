import React, { forwardRef } from 'react';
import wallImage from '../assets/thewall.png';

const TheWall = forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            className="wall-container"
            style={{
                position: 'relative',
                width: '100vw',
                height: '100vh',
                backgroundImage: `url(${wallImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0,
            }}
            tabIndex={0}
            {...props}
        >
            {props.children}
        </div>
    );
});

export default TheWall; 