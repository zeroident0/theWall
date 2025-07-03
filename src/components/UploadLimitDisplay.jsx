import React, { useState, useEffect } from 'react';
import { getUserUploadStats } from '../services/limitService';
import './UploadLimitDisplay.css';

const UploadLimitDisplay = () => {
    const [uploadStats, setUploadStats] = useState({
        uploadCount: 0,
        remaining: 3,
        canUpload: true,
        loading: true
    });

    useEffect(() => {
        const loadUploadStats = async () => {
            try {
                const stats = await getUserUploadStats();
                setUploadStats({
                    ...stats,
                    loading: false
                });
            } catch (error) {
                console.error('Error loading upload stats:', error);
                setUploadStats({
                    uploadCount: 0,
                    remaining: 3,
                    canUpload: true,
                    loading: false
                });
            }
        };

        loadUploadStats();

        // Refresh stats every minute
        const interval = setInterval(loadUploadStats, 60000);

        return () => clearInterval(interval);
    }, []);

    if (uploadStats.loading) {
        return (
            <div className="upload-limit-display loading">
                <span>Loading...</span>
            </div>
        );
    }

    return (
        // <div className={`upload-limit-display ${!uploadStats.canUpload ? 'limit-reached' : ''} ${uploadStats.infinityMode ? 'infinity-mode' : ''}`}>
        //     <div className="limit-info">
        //         <span className="limit-text">
        //             {uploadStats.infinityMode
        //                 ? '∞ Infinity uploads enabled'
        //                 : uploadStats.remaining > 0
        //                     ? `${uploadStats.remaining} upload${uploadStats.remaining !== 1 ? 's' : ''} remaining today`
        //                     : 'Daily limit reached'
        //             }
        //         </span>
        //         <div className="limit-bar">
        //             <div
        //                 className="limit-fill"
        //                 style={{
        //                     width: uploadStats.infinityMode
        //                         ? '0%'
        //                         : `${(uploadStats.uploadCount / 3) * 100}%`
        //                 }}
        //             ></div>
        //         </div>
        //     </div>
        // </div>
        <></>
    );
};

export default UploadLimitDisplay; 