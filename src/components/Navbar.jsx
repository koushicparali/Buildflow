import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell } from 'lucide-react';
import ProfileModal from './ProfileModal';
import NotificationCenter from './NotificationCenter';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Theme logic
    const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');

    useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light-mode');
            sessionStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-mode');
            sessionStorage.setItem('theme', 'dark');
        }
    }, [isLightMode]);

    const toggleTheme = () => setIsLightMode(!isLightMode);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogoutPrompt = () => {
        closeMenu();
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/client-project');

    const handleLogoClick = (e) => {
        closeMenu();
        if (isDashboard) {
            e.preventDefault();
            handleLogoutPrompt();
        }
    };

    if (location.pathname === '/dashboard-admin' && user?.role !== 'admin') {
        return null;
    }

    return (
        <>
        <nav className="navbar">
            <div className="brand-container">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={handleLogoClick}>
                    <img src="/assets/Logo.png" alt="BuildFlow Logo" className="logo" />
                    <span className="brand-name">BuildFlow</span>
                </Link>
            </div>
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                {isDashboard ? (
                    <>
                        {(location.pathname === '/dashboard-admin' || (!location.pathname.startsWith('/dashboard-') && user?.role === 'admin')) ? (
                            <>
                                <li><Link to={`/dashboard-admin`} className={location.pathname === `/dashboard-admin` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to="/dashboard-admin#projects" className={location.hash === '#projects' || location.pathname.startsWith('/client-project') ? 'active' : ''} onClick={closeMenu}>Projects</Link></li>
                                <li><Link to="/dashboard-admin#users" className={location.hash === '#users' ? 'active' : ''} onClick={closeMenu}>Users & Teams</Link></li>
                                <li><Link to="/dashboard-admin#queries" className={location.hash === '#queries' ? 'active' : ''} onClick={closeMenu}>Client Queries</Link></li>
                            </>
                        ) : (location.pathname === '/dashboard-pm' || (!location.pathname.startsWith('/dashboard-') && user?.role === 'pm')) ? (
                            <>
                                <li><Link to={`/dashboard-pm`} className={location.pathname === `/dashboard-pm` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>Project Overview</Link></li>
                                <li><Link to="/dashboard-pm#projects" className={location.hash === '#projects' || location.pathname.startsWith('/client-project') ? 'active' : ''} onClick={closeMenu}>Projects</Link></li>
                                <li><Link to="/dashboard-pm#tasks" className={location.hash === '#tasks' ? 'active' : ''} onClick={closeMenu}>Tasks</Link></li>
                            </>
                        ) : (location.pathname === '/dashboard-engineer' || (!location.pathname.startsWith('/dashboard-') && user?.role === 'engineer')) ? (
                            <>
                                <li><Link to={`/dashboard-engineer`} className={location.pathname === `/dashboard-engineer` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to="/dashboard-engineer#tasks" className={location.hash === '#tasks' ? 'active' : ''} onClick={closeMenu}>My Tasks</Link></li>
                            </>
                        ) : (location.pathname === '/dashboard-client' || (!location.pathname.startsWith('/dashboard-') && user?.role === 'client')) ? (
                            <>
                                <li><Link to={`/dashboard-client`} className={location.pathname === `/dashboard-client` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>Dashboard</Link></li>
                                <li><Link to="/dashboard-client#projects" className={location.hash === '#projects' || location.pathname.startsWith('/client-project') ? 'active' : ''} onClick={closeMenu}>My Projects</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to={`/dashboard-${user?.role || 'admin'}`} className={location.pathname === `/dashboard-${user?.role || 'admin'}` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to={`/dashboard-${user?.role || 'admin'}#projects`} className={location.hash === '#projects' || location.pathname.startsWith('/client-project') ? 'active' : ''} onClick={closeMenu}>Projects</Link></li>
                                <li><Link to={`/dashboard-${user?.role || 'admin'}#users`} className={location.hash === '#users' ? 'active' : ''} onClick={closeMenu}>Users & Teams</Link></li>
                                <li><Link to={`/dashboard-${user?.role || 'admin'}#queries`} className={location.hash === '#queries' ? 'active' : ''} onClick={closeMenu}>Client Queries</Link></li>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <li><Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>Home</Link></li>
                        <li><Link to="/features" className={location.pathname === '/features' ? 'active' : ''} onClick={closeMenu}>Features</Link></li>
                        <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>About</Link></li>
                        <li><Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''} onClick={closeMenu}>FAQ</Link></li>
                        <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>Contact</Link></li>
                    </>
                )}
            </ul>
            <div className="nav-actions">
                <button className="theme-toggle" aria-label="Toggle Theme" onClick={toggleTheme}>
                    {isLightMode ? '🌙' : '☀️'}
                </button>
                {isDashboard ? (
                    <>
                        <div style={{ position: 'relative' }}>
                            <button className="theme-toggle" style={{ position: 'relative' }} aria-label="Notifications" onClick={() => setShowNotifications(true)}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--error)', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--bg-nav)' }}></span>
                                )}
                            </button>
                            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
                        </div>
                        <button id="navLogoutBtn" className="btn outline-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleLogoutPrompt}>
                            <LogOut size={16} /> Log Out
                        </button>
                    </>
                ) : (
                    <button id="navAlertBtn" className="btn primary-btn" onClick={() => { navigate('/signup'); closeMenu(); }}>Sign Up</button>
                )}
                <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} id="mobile-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
        {showLogoutModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '400px', textAlign: 'center', backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.6rem' }}>Confirm Logout</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.5' }}>
                        Are you sure you want to log out of BuildFlow?
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn" style={{ flex: 1, background: '#e2e8f0', color: '#0f172a', border: 'none', fontWeight: '600' }} onClick={() => setShowLogoutModal(false)}>Cancel</button>
                        <button className="btn" style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none', fontWeight: '600' }} onClick={confirmLogout}>Yes, Log Out</button>
                    </div>
                </div>
            </div>
        )}
        
        {showProfileModal && (
            <ProfileModal onClose={() => setShowProfileModal(false)} />
        )}

        {isDashboard && user && (
            <div 
                className="floating-profile"
                onClick={() => setShowProfileModal(true)}
                style={{ position: 'fixed', bottom: '30px', left: '30px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: 'var(--bg-card)', padding: '0.6rem 1.2rem', borderRadius: '30px', border: '1px solid var(--border-light)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 900, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; }}
            >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold', overflow: 'hidden' }}>
                    {user?.profile_pic ? (
                        <img src={user.profile_pic.startsWith('http') ? user.profile_pic : `http://localhost:8000${user.profile_pic}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        user?.username?.substring(0,2).toUpperCase() || 'U'
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.2' }}>{user?.username || 'User'}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role || 'Guest'}</span>
                </div>
            </div>
        )}
        </>
    );
};

export default Navbar;

