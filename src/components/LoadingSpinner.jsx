import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="spinner-overlay">
            <div className="spinner-container">
                <div className="spinner-ring"></div>
                <div className="spinner-glow"></div>
                <p className="spinner-text">Loading BuildFlow...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
