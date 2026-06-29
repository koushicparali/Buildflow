import React from 'react';

const AboutSection = () => {
    return (
        <section id="about" className="about-section reveal fade-up">
            <div className="about-container">
                <div className="about-content reveal fade-left">
                    <h2>About BuildFlow</h2>
                    <p>At BuildFlow, we understand that managing construction sites is complex. Our mission is to simplify site management by providing an intuitive platform that connects your entire workforce.</p>
                    <p>Founded by industry veterans, we bridge the gap between the field and the office, ensuring that every task is tracked, communication is seamless, and projects are delivered on time and within budget.</p>
                </div>
                <div className="about-image reveal fade-right">
                    <img src="/assets/slide2.png" alt="Construction Site Team" />
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
