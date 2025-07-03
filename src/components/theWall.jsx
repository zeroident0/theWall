import React, { forwardRef } from 'react';
import wallImage from '../assets/thewall.png';

const TheWall = forwardRef((props, ref) => {
    return (
        <div
            ref={ref}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
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