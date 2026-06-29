import React from 'react';

const ContactForm = () => {
    return (
        <section id="query" className="query-section reveal fade-up">
            <div className="section-header">
                <h2>Have a Question?</h2>
                <p>Send us your queries and we'll get back to you shortly.</p>
            </div>
            <div className="query-container reveal fade-up">
                <form id="queryForm" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="q-name">Your Name</label>
                        <input type="text" id="q-name" placeholder="Enter your name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-email">Your Email</label>
                        <input type="email" id="q-email" placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-message">Message</label>
                        <textarea id="q-message" placeholder="How can we help you?" rows="5" required></textarea>
                    </div>
                    <button type="submit" className="btn submit-btn">Send Query</button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
