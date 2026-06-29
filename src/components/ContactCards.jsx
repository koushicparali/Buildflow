import React from 'react';

const ContactCards = () => {
    return (
        <div className="contact-cards" style={{ marginTop: '3rem' }}>
            <div className="contact-card reveal fade-up">
                <h3>📍 Office</h3>
                <p>123 Enterprise Way<br />Tech District, NY 10001</p>
            </div>
            <div className="contact-card reveal fade-up" style={{ transitionDelay: '0.2s' }}>
                <h3>📞 Phone</h3>
                <p>+1 (555) 123-4567<br />Mon-Fri, 9am - 5pm</p>
            </div>
            <div className="contact-card reveal fade-up" style={{ transitionDelay: '0.4s' }}>
                <h3>✉️ Email</h3>
                <p>support@buildflow.com<br />sales@buildflow.com</p>
            </div>
        </div>
    );
};

export default ContactCards;
