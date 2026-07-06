import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, X, Check, Trash2, Archive, Flag, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { notifications, unreadCount, markAllRead, markRead, archive, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'Unread' && n.is_read) return false;
        if (filter === 'Critical' && n.priority !== 'Critical') return false;
        if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '400px',
            maxWidth: '100vw',
            height: '100vh',
            background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-light)',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease-out'
        }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Bell size={24} style={{ color: 'var(--text-main)' }} />
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Notifications</h2>
                    {unreadCount > 0 && (
                        <span style={{ background: 'var(--accent)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {unreadCount} New
                        </span>
                    )}
                </div>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
            </div>

            {/* Filters & Actions */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {['All', 'Unread', 'Critical'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            background: filter === f ? 'var(--accent)' : 'transparent',
                            color: filter === f ? '#000' : 'var(--text-muted)',
                            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border-light)'}`,
                            padding: '0.4rem 1rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>{f}</button>
                    ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search notifications..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={markAllRead} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Check size={14} /> Mark all as read
                    </button>
                    <button onClick={clearAll} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Trash2 size={14} /> Clear All
                    </button>
                </div>
            </div>

            {/* Notification List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
                        <Bell size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No notifications found.</p>
                    </div>
                ) : (
                    filteredNotifications.map(notif => (
                        <div key={notif.id} style={{
                            background: notif.is_read ? 'transparent' : 'rgba(255, 140, 0, 0.05)',
                            border: '1px solid',
                            borderColor: notif.is_read ? 'var(--border-light)' : 'rgba(255, 140, 0, 0.3)',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            borderLeft: `4px solid ${notif.priority === 'Critical' ? 'var(--error)' : notif.priority === 'High' ? 'var(--warning)' : notif.is_read ? 'var(--border-light)' : 'var(--accent)'}`,
                            transition: 'all 0.2s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: notif.priority === 'Critical' ? 'var(--error)' : 'var(--text-muted)', fontWeight: 'bold' }}>
                                    {notif.category.toUpperCase()} {notif.priority === 'Critical' && '• CRITICAL'}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {new Date(notif.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1rem' }}>
                                {notif.count > 1 ? `(${notif.count}x) ` : ''}{notif.title}
                            </h4>
                            <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {notif.message}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {notif.action_url ? (
                                    <button 
                                        className="btn outline-btn" 
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        onClick={() => {
                                            if(!notif.is_read) markRead(notif.id);
                                            navigate(notif.action_url);
                                            onClose();
                                        }}
                                    >
                                        View Action
                                    </button>
                                ) : <div />}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {!notif.is_read && (
                                        <button onClick={() => markRead(notif.id)} title="Mark as Read" style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                                            <Check size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => archive(notif.id)} title="Archive" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <Archive size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

export default NotificationCenter;
