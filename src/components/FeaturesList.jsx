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
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Task Accessibility</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Assign tasks directly to workers' devices for easy access and instant updates.</p>
                </div>

                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Process Tracking</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Monitor worker progress and site activity in real time from a centralized dashboard.</p>
                </div>

                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.4s' }}>
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Seamless Communication</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Connect the entire workforce to resolve issues instantly and keep the project moving.</p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesList;
