import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'pm'
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await apiFetch('/users/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            // Automatically log in
            const success = await login(formData.username, formData.password);
            if (success) {
                if (formData.role === 'pm') navigate('/dashboard-pm');
                else if (formData.role === 'engineer') navigate('/dashboard-engineer');
                else if (formData.role === 'contractor') navigate('/dashboard-contractor');
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
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" placeholder="Username" required value={formData.username} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">I am a...</label>
                        <select id="role" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={formData.role} onChange={handleChange}>
                            <option value="pm">Project Manager</option>
                            <option value="engineer">Engineer</option>
                            <option value="contractor">Contractor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Create a password" required value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <input type="checkbox" required style={{ marginTop: '0.2rem' }} />
                            <span>I agree to the <Link to="/terms" style={{ color: 'var(--accent)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link></span>
                        </label>
                    </div>
                    <button type="submit" className="btn submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>Sign Up</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/" style={{ color: 'var(--accent)' }}>Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
