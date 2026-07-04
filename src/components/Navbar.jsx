import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Theme logic
    const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');

    useEffect(() => {
        if (isLightMode) {
            document.documentElement.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
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

    const handleLogoClick = (e) => {
        if (user) {
            e.preventDefault();
            setShowLogoutModal(true);
        } else {
            closeMenu();
        }
    };

    const isDashboard = location.pathname.startsWith('/dashboard');

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
                        {user?.role === 'pm' ? (
                            <>
                                <li><Link to={`/dashboard-pm`} className={location.pathname === `/dashboard-pm` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>Dashboard</Link></li>
                                <li><Link to="#projects" className={location.hash === '#projects' ? 'active' : ''} onClick={closeMenu}>Projects</Link></li>
                                <li><Link to="#tasks" className={location.hash === '#tasks' ? 'active' : ''} onClick={closeMenu}>Tasks</Link></li>
                                <li><Link to="#reports" className={location.hash === '#reports' ? 'active' : ''} onClick={closeMenu}>Reports</Link></li>
                                <li><Link to="#alerts" className={location.hash === '#alerts' ? 'active' : ''} onClick={closeMenu}>Alerts</Link></li>
                            </>
                        ) : user?.role === 'engineer' ? (
                            <>
                                <li><Link to={`/dashboard-engineer`} className={location.pathname === `/dashboard-engineer` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to="#tasks" className={location.hash === '#tasks' ? 'active' : ''} onClick={closeMenu}>My Tasks</Link></li>
                            </>
                        ) : user?.role === 'contractor' ? (
                            <>
                                <li><Link to={`/dashboard-contractor`} className={location.pathname === `/dashboard-contractor` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to="#projects" className={location.hash === '#projects' ? 'active' : ''} onClick={closeMenu}>Assigned Projects</Link></li>
                                <li><Link to="#tasks" className={location.hash === '#tasks' ? 'active' : ''} onClick={closeMenu}>My Tasks</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to={`/dashboard-${user?.role || 'admin'}`} className={location.pathname === `/dashboard-${user?.role || 'admin'}` && (!location.hash || location.hash === '#overview') ? 'active' : ''} onClick={closeMenu}>System Overview</Link></li>
                                <li><Link to="#projects" className={location.hash === '#projects' ? 'active' : ''} onClick={closeMenu}>Projects</Link></li>
                                <li><Link to="#users" className={location.hash === '#users' ? 'active' : ''} onClick={closeMenu}>Users & Teams</Link></li>
                                <li><Link to="#queries" className={location.hash === '#queries' ? 'active' : ''} onClick={closeMenu}>Client Queries</Link></li>
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
                    <button id="navLogoutBtn" className="btn outline-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleLogoutPrompt}>
                        <LogOut size={16} /> Log Out
                    </button>
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
        </>
    );
};

export default Navbar;

