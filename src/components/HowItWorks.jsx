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
                    <div className="step-number">1</div>
                    <h3>Assign Tasks</h3>
                    <p>Create and assign tasks to your workforce effortlessly from the dashboard.</p>
                </div>
                <div className="step-card reveal fade-up">
                    <div className="step-number">2</div>
                    <h3>Monitor Progress</h3>
                    <p>Track real-time updates as your staff completes their assigned duties.</p>
                </div>
                <div className="step-card reveal fade-right">
                    <div className="step-number">3</div>
                    <h3>Review & Report</h3>
                    <p>Generate reports and analyze performance to improve future operations.</p>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
