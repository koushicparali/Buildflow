import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const loadUserFromToken = () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setUser({
                    user_id: parseInt(decoded.user_id, 10),
                    role: decoded.role || 'admin', // we will pass role in token or assume if it's there
                });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadUserFromToken();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            const decoded = parseJwt(data.access);
            const userRole = decoded?.role || 'admin';
            setUser({
                user_id: parseInt(decoded?.user_id, 10),
                role: userRole,
            });
            return userRole;
        } catch (error) {
            console.error("Login failed", error);
            return null;
        }
    };

    const logout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setShowLogoutModal(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
            {showLogoutModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxWidth: '400px', width: '90%', textAlign: 'center', animation: 'fadeInUp 0.3s ease-out' }}>
                        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 700 }}>Confirm Logout</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>Are you sure you want to log out of BuildFlow?</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn outline-btn" style={{ flex: 1, padding: '0.8rem' }} onClick={cancelLogout}>Cancel</button>
                            <button style={{ flex: 1, padding: '0.8rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem' }} onClick={confirmLogout}>Yes, Log Out</button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};
