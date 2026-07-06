import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import ImageCropperModal from '../components/ImageCropperModal';
import { Camera, User } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        role: 'unassigned',
        profile_pic: null
    });
    const [error, setError] = useState(null);
    const [agreed, setAgreed] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [usernameError, setUsernameError] = useState(null);
    const typingTimeoutRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        
        if (e.target.id === 'username') {
            const val = e.target.value;
            setUsernameError(null);
            
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            
            if (val.trim()) {
                typingTimeoutRef.current = setTimeout(async () => {
                    try {
                        const res = await fetch(`http://localhost:8000/api/users/check_username/?username=${val}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.exists) {
                                setUsernameError("exists");
                            } else {
                                setUsernameError("available");
                            }
                        }
                    } catch (err) {
                        console.error("Username check failed", err);
                    }
                }, 500);
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCropImageSrc(reader.result);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedFile) => {
        setFormData({ ...formData, profile_pic: croppedFile });
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setShowCropper(false);
        setCropImageSrc(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!formData.first_name || !formData.username || !formData.email || !formData.password || !formData.confirm_password) {
            setError("Please fill all required fields.");
            return;
        }

        if (usernameError === "exists") {
            setError("Please choose a different username.");
            return;
        }
        
        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const apiData = new FormData();
            apiData.append('first_name', formData.first_name);
            apiData.append('last_name', formData.last_name);
            apiData.append('username', formData.username);
            apiData.append('email', formData.email);
            apiData.append('password', formData.password);
            apiData.append('role', formData.role);
            if (formData.profile_pic) {
                apiData.append('profile_pic', formData.profile_pic);
            }

            await apiFetch('/users/', {
                method: 'POST',
                body: apiData
            });
            // Automatically log in
            const success = await login(formData.username, formData.password);
            if (success) {
                if (formData.role === 'pm') navigate('/dashboard-pm');
                else if (formData.role === 'engineer') navigate('/dashboard-engineer');
                else if (formData.role === 'client') navigate('/dashboard-client');
                else navigate('/pending-approval');
            } else {
                setError("Registration succeeded but login failed.");
            }
        } catch (err) {
            setError(err.message || "Failed to register.");
        }
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-container" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>
                {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form id="signupForm" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px dashed var(--accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '0.8rem', cursor: 'pointer' }}>
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={40} style={{ color: 'var(--text-muted)' }} />
                            )}
                            <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.2rem', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                                <Camera size={16} color="#fff" />
                                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            </label>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Profile Picture (Optional)</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="first_name">First Name</label>
                            <input type="text" id="first_name" placeholder="First Name" required value={formData.first_name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="last_name">Last Name (Optional)</label>
                            <input type="text" id="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" placeholder="Username" required value={formData.username} onChange={handleChange} />
                        {usernameError && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: usernameError === 'available' ? 'var(--success)' : 'var(--error)' }}>
                                {usernameError === 'available' ? '✓ Username is available' : 'X Username already exists'}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Create a password" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <input type="password" id="confirm_password" placeholder="Confirm your password" required value={formData.confirm_password} onChange={handleChange} />
                        {formData.confirm_password && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: formData.password === formData.confirm_password ? 'var(--success)' : 'var(--error)' }}>
                                {formData.password === formData.confirm_password ? '✓ Passwords match' : 'X Passwords do not match'}
                            </div>
                        )}
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <input 
                                type="checkbox" 
                                required 
                                style={{ marginTop: '0.2rem', width: 'auto', accentColor: 'var(--accent)', cursor: 'pointer' }} 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <span>I agree to the <Link to="/terms" style={{ color: 'var(--accent)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link></span>
                        </label>
                    </div>
                    <button type="submit" className="btn submit-btn" style={{ width: '100%', marginBottom: '1rem', opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }} disabled={!agreed}>Sign Up</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/" style={{ color: 'var(--accent)' }}>Log in</Link>
                    </p>
                </form>
            </div>
            {showCropper && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setShowCropper(false);
                        setCropImageSrc(null);
                    }}
                />
            )}
        </div>
    );
};

export default Signup;
