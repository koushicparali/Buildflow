import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const slideData = [
    { title: "Enterprise Construction Management", text: "End-to-end task tracking, role-based dashboards, and complete oversight from the field to the back office.", bg: "/assets/slide1.webp" },
    { title: "Intelligent Notification Engine", text: "Stay informed with real-time, context-aware alerts for task updates, milestones, and project approvals.", bg: "/assets/slide2.webp" },
    { title: "Transparent Client Collaboration", text: "Give your clients peace of mind with total visibility into project milestones, live task updates, and progress.", bg: "/assets/slide3.webp" },
    { title: "Collaborative Project Workspaces", text: "Connect clients, engineers, and project managers in a unified hub for files, comments, and reports.", bg: "/assets/slide4.webp" }
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    // Manage slider timer
    useEffect(() => {
        const timer = setInterval(() => {
            handleSlideChange((currentSlide + 1) % slideData.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide]);

    const handleSlideChange = (newIndex) => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentSlide(newIndex);
            setIsFading(false);
        }, 300); // 300ms matches the fade transition
    };

    return (
        <header id="home" className="hero-banner">
            <div className="bg-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slideData.map((slide, index) => (
                    <div 
                        key={index} 
                        className={`bg-slide ${index === currentSlide ? 'active' : ''}`} 
                        style={{ backgroundImage: `url('${slide.bg}')` }}
                    ></div>
                ))}
            </div>
            
            <div className="slider-controls">
                <button className="slider-btn prev" onClick={() => handleSlideChange((currentSlide - 1 + slideData.length) % slideData.length)} aria-label="Previous Slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className="slider-btn next" onClick={() => handleSlideChange((currentSlide + 1) % slideData.length)} aria-label="Next Slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
            <div className="slider-indicators">
                {slideData.map((_, index) => (
                    <span 
                        key={index}
                        className={`dot ${index === currentSlide ? 'active' : ''}`} 
                        onClick={() => handleSlideChange(index)}
                    ></span>
                ))}
            </div>

            <div className="hero-container">
                <div className="hero-content" style={{ opacity: isFading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
                    <h1 style={{ letterSpacing: '-0.03em' }}>{slideData[currentSlide].title}</h1>
                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{slideData[currentSlide].text}</p>
                    <button className="btn accent-btn" onClick={() => document.getElementById('query').scrollIntoView({ behavior: 'smooth' })}>Get Started</button>
                </div>
                
                <div className="hero-login-card scale-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>
                    <h2 style={{ letterSpacing: '-0.025em', marginBottom: '2rem' }}>Welcome Back</h2>
                    <form id="heroLoginForm" onSubmit={async (e) => { 
                        e.preventDefault(); 
                        const userRole = await login(username, password);
                        if (userRole) {
                            if (userRole === 'admin') {
                                addToast(`You shouldn't be here. The shadows are watching. Access denied.`, 'error');
                            } else if (userRole === 'unassigned') {
                                addToast('Login successful! Awaiting admin approval.', 'success');
                                navigate('/pending-approval');
                            } else {
                                addToast('Login successful!', 'success');
                                navigate(`/dashboard-${userRole}`);
                            }
                        } else {
                            addToast('Invalid credentials. Please try again.', 'error');
                        }
                    }}>
                        <div className="form-group">
                            <label htmlFor="login-username">Username</label>
                            <input type="text" id="login-username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ border: '1px solid var(--border-light)' }} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input type="password" id="login-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ border: '1px solid var(--border-light)' }} />
                        </div>
                        <button type="submit" className="btn submit-btn" style={{ width: '100%', marginBottom: '1.5rem', fontWeight: '700' }}>Sign In</button>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            Don't have an account? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: '600' }}>Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Hero;
