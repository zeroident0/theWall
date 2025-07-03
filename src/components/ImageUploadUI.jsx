import React, { forwardRef } from 'react';
import ImageUploader from './ImageUploader';
import './ImageUploader.css';

const ImageUploadUI = forwardRef((props, ref) => (
    <div className="image-uploader-fixed">
        <ImageUploader ref={ref} {...props} />
    </div>
));

export default ImageUploadUI; 