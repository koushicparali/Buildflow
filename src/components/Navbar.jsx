import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const handleLogout = () => {
        closeMenu();
        logout();
    };

    const isDashboard = location.pathname.startsWith('/dashboard');

    return (
        <nav className="navbar">
            <div className="brand-container">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={closeMenu}>
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
                    <button id="navLogoutBtn" className="btn outline-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)' }} onClick={handleLogout}>
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
    );
};

export default Navbar;

