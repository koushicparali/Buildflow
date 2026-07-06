import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    
    // A simple base64 encoded notification sound (short pop)
    const playNotificationSound = () => {
        const soundEnabled = localStorage.getItem('notificationSounds') !== 'false';
        if (soundEnabled) {
            try {
                const audio = new Audio("/assets/notification.ogg");
                audio.volume = 0.5;
                audio.play().catch(e => console.log('Audio play failed:', e));
            } catch (err) {
                console.error("Audio error", err);
            }
        }
    };

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        playNotificationSound();
        
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 10000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}>
                {toasts.map(toast => {
                    if (toast.type === 'enterprise') {
                        const notif = toast.message; // When type is enterprise, message is the notif object
                        return (
                            <div key={toast.id} style={{
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                padding: '1.2rem',
                                borderRadius: '12px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                                border: '1px solid var(--border-light)',
                                borderLeft: `4px solid ${notif.priority === 'Critical' ? 'var(--error)' : notif.priority === 'High' ? 'var(--warning)' : 'var(--accent)'}`,
                                animation: 'slideIn 0.3s ease-out forwards',
                                minWidth: '300px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.8rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: notif.priority === 'Critical' ? 'var(--error)' : notif.priority === 'High' ? 'var(--warning)' : 'var(--text-muted)' }}>
                                            {notif.priority}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {notif.category}</span>
                                    </div>
                                    <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                                </div>
                                <div>
                                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1rem', color: 'var(--text-main)' }}>{notif.title}</h4>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{notif.message}</p>
                                </div>
                                {notif.action_url && (
                                    <a href={notif.action_url} style={{ fontSize: '0.9rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold', alignSelf: 'flex-start' }} onClick={() => removeToast(toast.id)}>
                                        View Details
                                    </a>
                                )}
                            </div>
                        );
                    }

                    return (
                    <div key={toast.id} style={{
                        background: toast.type === 'error' ? 'var(--error)' : toast.type === 'success' ? 'var(--success)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--bg-card)',
                        color: toast.type === 'info' ? 'var(--text-main)' : '#fff',
                        padding: '1rem 1.5rem',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: toast.type === 'info' ? '1px solid var(--border-light)' : 'none',
                        animation: 'slideIn 0.3s ease-out forwards',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minWidth: '250px'
                    }}>
                        <span>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            marginLeft: '1rem',
                            opacity: 0.7
                        }}>✕</button>
                    </div>
                )})}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
