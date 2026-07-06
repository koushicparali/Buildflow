import React from 'react';

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="how-it-works-section reveal fade-up">
            <div className="section-header">
                <h2>How It Works</h2>
                <p>A simple process to streamline your site management.</p>
            </div>
            <div className="steps-container">
                <div className="step-card reveal fade-left">
                    <div className="step-number" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', color: '#0b0f19', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, margin: '0 auto 1.8rem', boxShadow: '0 8px 20px -6px var(--accent)' }}>1</div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Assign Tasks</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Create and assign tasks to your workforce effortlessly from the dashboard.</p>
                </div>
                <div className="step-card reveal fade-up">
                    <div className="step-number" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', color: '#0b0f19', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, margin: '0 auto 1.8rem', boxShadow: '0 8px 20px -6px var(--accent)' }}>2</div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Monitor Progress</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Track real-time updates as your staff completes their assigned duties.</p>
                </div>
                <div className="step-card reveal fade-right">
                    <div className="step-number" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', color: '#0b0f19', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, margin: '0 auto 1.8rem', boxShadow: '0 8px 20px -6px var(--accent)' }}>3</div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.8rem' }}>Client Transparency</h3>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>Give clients total visibility into project milestones, live task updates, and transparent communication.</p>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
