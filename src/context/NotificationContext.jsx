import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';
import { useToast } from './ToastContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const playEnterpriseSound = useCallback((priority) => {
        try {
            let src = "/assets/notification.ogg";
            if (priority === 'Critical') src = "/assets/notification.ogg"; // Fallback for critical
            if (priority === 'Low') return; // Silent
            
            const audio = new Audio(src);
            audio.volume = priority === 'Critical' ? 1.0 : 0.5;
            audio.play().catch(() => {});
        } catch (err) {}
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const data = await apiFetch('/notifications/');
            
            // Group identical notifications
            const grouped = [];
            data.forEach(n => {
                const existing = grouped.find(g => g.title === n.title && g.message === n.message);
                if (existing && n.priority !== 'Critical') {
                    existing.count = (existing.count || 1) + 1;
                    if (!n.is_read) existing.is_read = false;
                } else {
                    grouped.push({ ...n, count: 1 });
                }
            });
            
            setNotifications(grouped);
            setUnreadCount(grouped.filter(n => !n.is_read).length);

            // Check for new popups
            data.forEach(n => {
                if (!n.popup_displayed) {
                    if (n.priority !== 'Low') {
                        // Display enterprise toast
                        addToast({
                            title: n.title,
                            message: n.message,
                            priority: n.priority,
                            category: n.category,
                            action_url: n.action_url,
                            id: n.id
                        }, 'enterprise');
                        playEnterpriseSound(n.priority);
                    }
                    // Mark popup displayed on backend
                    apiFetch(`/notifications/${n.id}/dismiss_popup/`, { method: 'POST' });
                }
            });
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, [user, addToast, playEnterpriseSound]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAllRead = async () => {
        await apiFetch('/notifications/mark_all_read/', { method: 'POST' });
        fetchNotifications();
    };

    const markRead = async (id) => {
        await apiFetch(`/notifications/${id}/mark_read/`, { method: 'POST' });
        fetchNotifications();
    };

    const archive = async (id) => {
        await apiFetch(`/notifications/${id}/archive/`, { method: 'POST' });
        fetchNotifications();
    };

    const clearAll = async () => {
        await apiFetch('/notifications/clear_all/', { method: 'DELETE' });
        fetchNotifications();
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAllRead,
            markRead,
            archive,
            clearAll,
            refresh: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
