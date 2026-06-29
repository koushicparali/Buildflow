import React from 'react';
import { Link } from 'react-router-dom';

const Signup = () => {
    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-container" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '500px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create an Account</h2>
                <form id="signupForm" onSubmit={(e) => { e.preventDefault(); window.location.href = '/login'; }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" placeholder="John" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text" id="lastName" placeholder="Doe" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">I am a...</label>
                        <select id="role" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                            <option value="admin">Administrator</option>
                            <option value="pm">Project Manager</option>
                            <option value="engineer">Engineer</option>
                            <option value="contractor">Contractor</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Create a password" required />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            <input type="checkbox" required style={{ marginTop: '0.2rem' }} />
                            <span>I agree to the <Link to="/terms" style={{ color: 'var(--accent)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link></span>
                        </label>
                    </div>
                    <button type="submit" className="btn submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>Sign Up</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Signup;
