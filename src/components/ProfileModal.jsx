import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';
import { X, Camera, Lock, User, Upload } from 'lucide-react';

const ProfileModal = ({ onClose }) => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile'); // profile or security
    
    // Form states
    const [username, setUsername] = useState(user?.username || '');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profile_pic || null);
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    React.useEffect(() => {
        if (user?.user_id) {
            apiFetch(`/users/${user.user_id}/`).then(data => {
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setEmail(data.email || '');
                setUsername(data.username || '');
            }).catch(console.error);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePic(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('first_name', firstName);
            formData.append('last_name', lastName);
            formData.append('email', email);
            if (profilePic) {
                formData.append('profile_pic', profilePic);
            }

            // Using fetch directly because we need to send FormData without Content-Type: application/json
            const token = sessionStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/users/me/update/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.username) {
                    throw new Error(`Username: ${errorData.username[0]}`);
                }
                if (errorData.email) {
                    throw new Error(`Email: ${errorData.email[0]}`);
                }
                throw new Error(errorData.detail || 'Failed to update profile');
            }

            const updatedUser = await response.json();

            // Re-login or update context (assuming login can handle a token refresh or we just show a toast)
            updateUser({ username: updatedUser.username, profile_pic: updatedUser.profile_pic });
            addToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.error(err);
            addToast(err.message, 'error');
        }
        setLoading(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addToast("New passwords don't match!", 'error');
            return;
        }
        
        setLoading(true);
        try {
            await apiFetch('/users/me/change-password/', {
                method: 'POST',
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });
            addToast('Password changed successfully!', 'success');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error(err);
            if (err.message.includes('old_password')) {
                addToast('Wrong current password.', 'error');
            } else {
                addToast(err.message, 'error');
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
            <div style={{ background: 'var(--bg-dark)', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-hover)', boxShadow: 'var(--card-shadow-hover)', overflow: 'hidden' }}>
                
                {/* Header */}
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>Account Settings</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)' }}>
                    <button 
                        onClick={() => setActiveTab('profile')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'profile' ? 'rgba(255, 140, 0, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'profile' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <User size={18} /> Profile Info
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        style={{ flex: 1, padding: '1rem', background: activeTab === 'security' ? 'rgba(255, 140, 0, 0.1)' : 'transparent', border: 'none', borderBottom: activeTab === 'security' ? '2px solid var(--accent)' : '2px solid transparent', color: activeTab === 'security' ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    {activeTab === 'profile' ? (
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px dashed var(--accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '1rem' }}>
                                    {previewUrl ? (
                                        <img src={previewUrl.startsWith('http') || previewUrl.startsWith('blob:') ? previewUrl : `http://localhost:8000${previewUrl}`} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={40} style={{ color: 'var(--text-muted)' }} />
                                    )}
                                    <label style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '0.2rem', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Camera size={16} color="#fff" />
                                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click icon to upload</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} 
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>First Name</label>
                                    <input 
                                        type="text" 
                                        value={firstName} 
                                        onChange={(e) => setFirstName(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Last Name</label>
                                    <input 
                                        type="text" 
                                        value={lastName} 
                                        onChange={(e) => setLastName(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    disabled
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                                />
                            </div>
                            
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Role</label>
                                <input 
                                    type="text" 
                                    value={user?.role || 'Guest'} 
                                    disabled
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'not-allowed', textTransform: 'capitalize' }}
                                />
                            </div>

                            <button type="submit" disabled={loading} className="btn accent-btn" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Password</label>
                                <input 
                                    type="password" 
                                    value={oldPassword} 
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} 
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
                                <input 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} 
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} 
                                />
                            </div>

                            <button type="submit" disabled={loading} className="btn accent-btn" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                {loading ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ProfileModal;
