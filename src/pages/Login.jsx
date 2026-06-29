import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="login-container" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                <form id="loginForm" onSubmit={(e) => { e.preventDefault(); window.location.href = '/dashboard-client'; }}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password" required />
                    </div>
                    <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Forgot password?</a>
                    </div>
                    <button type="submit" className="btn submit-btn" style={{ width: '100%', marginBottom: '1rem' }}>Log In</button>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)' }}>Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
