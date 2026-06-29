import React, { useState, useEffect } from 'react';

const slideData = [
    { title: "Empower Your Staff & Track Progress", text: "Assign tasks, monitor real-time progress, and streamline communication across the entire site.", bg: "/assets/slide1.png" },
    { title: "Real-Time Site Analytics", text: "Get actionable insights and live updates directly from your construction sites to stay ahead of schedule.", bg: "/assets/slide2.png" },
    { title: "Seamless Team Collaboration", text: "Connect everyone from the field workers to the back office in one unified, easy-to-use platform.", bg: "/assets/slide3.png" },
    { title: "Boost Project Efficiency", text: "Save hours of administrative work, reduce delays, and focus on building faster and better.", bg: "/assets/slide4.png" }
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFading, setIsFading] = useState(false);
    
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
                <button className="slider-btn prev" onClick={() => handleSlideChange((currentSlide - 1 + slideData.length) % slideData.length)}>&#10094;</button>
                <button className="slider-btn next" onClick={() => handleSlideChange((currentSlide + 1) % slideData.length)}>&#10095;</button>
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
                    <h1>{slideData[currentSlide].title}</h1>
                    <p>{slideData[currentSlide].text}</p>
                    <button className="btn accent-btn modal-trigger" onClick={() => window.dispatchEvent(new CustomEvent('openQuoteModal'))}>Get Started</button>
                </div>
                
                <div className="hero-login-card">
                    <h2>Welcome Back</h2>
                    <form id="heroLoginForm" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label htmlFor="login-email">Email</label>
                            <input type="email" id="login-email" placeholder="Enter your email" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input type="password" id="login-password" placeholder="Enter your password" required />
                        </div>
                        <button type="submit" className="btn submit-btn">Sign In</button>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Hero;
