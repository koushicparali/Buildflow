import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';
import { X, Check } from 'lucide-react';

const ImageCropperModal = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (crop) => setCrop(crop);
    const onZoomChange = (zoom) => setZoom(zoom);
    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedImage);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ position: 'relative', width: '90%', maxWidth: '500px', background: 'var(--bg-dark)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                {/* Header */}
                <div style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>Crop Profile Picture</h3>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem', borderRadius: '50%' }}>
                        <X size={24} />
                    </button>
                </div>
                
                {/* Cropper Container */}
                <div style={{ position: 'relative', width: '100%', height: '400px', background: '#000' }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                    />
                </div>

                {/* Footer Controls */}
                <div style={{ padding: '1.5rem', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Zoom</span>
                        <input 
                            type="range" 
                            min={1} 
                            max={3} 
                            step={0.1} 
                            value={zoom} 
                            onChange={(e) => setZoom(e.target.value)} 
                            style={{ flex: 1, accentColor: 'var(--accent)' }} 
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={onCancel} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease' }} onMouseOver={(e)=>e.target.style.background='rgba(255,255,255,0.05)'} onMouseOut={(e)=>e.target.style.background='transparent'}>Cancel</button>
                        <button onClick={handleConfirm} disabled={loading} style={{ flex: 1, padding: '0.8rem', background: 'var(--accent-gradient)', border: 'none', borderRadius: '12px', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 600, boxShadow: '0 4px 15px var(--accent-glow)' }}>
                            {loading ? 'Processing...' : <><Check size={18} /> Apply Crop</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropperModal;
