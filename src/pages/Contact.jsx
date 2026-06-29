import React from 'react';
import ContactForm from '../components/ContactForm';
import ContactCards from '../components/ContactCards';

const Contact = () => {
    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <section className="contact-section" style={{ padding: '4rem 10%' }}>
                <div className="section-header">
                    <h2>Get in Touch</h2>
                    <p>We are here to assist you.</p>
                </div>
                <ContactCards />
                <div style={{ marginTop: '4rem' }}>
                    <ContactForm />
                </div>
            </section>
        </div>
    );
};

export default Contact;
