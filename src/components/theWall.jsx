import React, { forwardRef } from 'react';
import wallImage from '../assets/thewall.png';

const TheWall = forwardRef(({ children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className="wall-container"
            style={{
                position: 'relative',
                width: '1200px',
                maxWidth: '1500px',
                minWidth: '1200px',
                height: '100vh',
                backgroundImage: `url(${wallImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 0,
                margin: '0 auto',
            }}
            tabIndex={0}
            {...props}
        >
            {children}
        </div>
    );
});

export default TheWall; 