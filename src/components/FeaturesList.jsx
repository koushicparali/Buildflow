import React from 'react';

const FeaturesList = () => {
    return (
        <section id="features" className="features-section reveal fade-up">
            <div className="section-header">
                <h2>Staff Management Tools</h2>
                <p>Everything you need to keep your workforce on track.</p>
            </div>
            <div className="card-container">
                <div className="feature-card reveal fade-up">
                    <div className="card-icon">📱</div>
                    <h3>Task Accessibility</h3>
                    <p>Assign tasks directly to workers' devices for easy access and instant updates.</p>
                </div>
                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                    <div className="card-icon">📊</div>
                    <h3>Process Tracking</h3>
                    <p>Monitor worker progress and site activity in real time from a centralized dashboard.</p>
                </div>
                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.4s' }}>
                    <div className="card-icon">💬</div>
                    <h3>Seamless Communication</h3>
                    <p>Connect the entire workforce to resolve issues instantly and keep the project moving.</p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesList;
