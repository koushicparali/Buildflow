import React from 'react';

const FeaturesList = () => {
    return (
        <section id="features" className="features-section reveal fade-up">
            <div className="section-header">
                <h2>Enterprise Power Features</h2>
                <p>Everything you need to keep your workforce on track and projects profitable.</p>
            </div>
            <div className="card-container">
                <div className="feature-card reveal fade-up">
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                            <line x1="12" y1="18" x2="12.01" y2="18" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Role-Based Dashboards</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Custom workspaces tailored for Admins, Project Managers, Engineers, and Clients.</p>
                </div>

                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Real-Time Notifications</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>An advanced notification center with popups, priorities, and sound alerts keeps everyone in sync.</p>
                </div>

                <div className="feature-card reveal fade-up" style={{ transitionDelay: '0.4s' }}>
                    <div className="card-icon" style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 166, 35, 0.08)', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Client Transparency</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Build trust with clients by offering them a direct window into project milestones, task statuses, and approvals.</p>
                </div>
            </div>
        </section>
    );
};

export default FeaturesList;
