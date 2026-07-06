import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    };

    const loadUserFromToken = () => {
        const token = sessionStorage.getItem('access_token');
        if (token) {
            const decoded = parseJwt(token);
            if (decoded) {
                setUser({
                    user_id: parseInt(decoded.user_id, 10),
                    role: decoded.role || 'admin',
                    username: decoded.username || 'User',
                    profile_pic: decoded.profile_pic || null,
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
            sessionStorage.setItem('access_token', data.access);
            sessionStorage.setItem('refresh_token', data.refresh);
            const decoded = parseJwt(data.access);
            const userRole = decoded?.role || 'admin';
            const userId = parseInt(decoded?.user_id, 10);
            
            const userUsername = decoded?.username || 'User';
            const userProfilePic = decoded?.profile_pic || null;
            
            const userInfo = { id: userId, role: userRole, username: userUsername, profile_pic: userProfilePic };
            sessionStorage.setItem('user_info', JSON.stringify(userInfo));
            
            setUser({
                user_id: userId,
                role: userRole,
                username: userUsername,
                profile_pic: userProfilePic,
            });
            return userRole;
        } catch (error) {
            console.error("Login failed", error);
            return null;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user_info');
        sessionStorage.removeItem('admin_unlocked');
        navigate('/');
    }, [navigate]);

    const updateUser = (newData) => {
        setUser((prev) => ({ ...prev, ...newData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
