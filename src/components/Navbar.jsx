import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
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

    return (
        <nav className="navbar">
            <div className="brand-container">
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }} onClick={closeMenu}>
                    <img src="/assets/Logo.png" alt="BuildFlow Logo" className="logo" />
                    <span className="brand-name">BuildFlow</span>
                </Link>
            </div>
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <li><Link to="/" onClick={closeMenu}>Home</Link></li>
                <li><Link to="/features" onClick={closeMenu}>Features</Link></li>
                <li><Link to="/about" onClick={closeMenu}>About</Link></li>
                <li><Link to="/faq" onClick={closeMenu}>FAQ</Link></li>
                <li><Link to="/contact" onClick={closeMenu}>Contact</Link></li>
                
                {/* Simulated Auth Links for Demo */}
                <li className="dropdown">
                    <span style={{ cursor: 'pointer', color: 'var(--text-main)', fontWeight: '600' }}>Dashboards ▾</span>
                    <ul className="dropdown-menu">
                        <li><Link to="/dashboard-admin" onClick={closeMenu}>Admin</Link></li>
                        <li><Link to="/dashboard-pm" onClick={closeMenu}>Proj Manager</Link></li>
                        <li><Link to="/dashboard-engineer" onClick={closeMenu}>Engineer</Link></li>
                        <li><Link to="/dashboard-contractor" onClick={closeMenu}>Contractor</Link></li>
                    </ul>
                </li>
            </ul>
            <div className="nav-actions">
                <button className="theme-toggle" aria-label="Toggle Theme" onClick={toggleTheme}>
                    {isLightMode ? '🌙' : '☀️'}
                </button>
                <button id="navAlertBtn" className="btn primary-btn" onClick={() => { navigate('/login'); closeMenu(); }}>Login</button>
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
