import React from 'react';

const Privacy = () => {
    return (
        <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '100px 2rem 4rem 2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '1rem' }}>Last updated: June 2026</p>
                <p style={{ marginBottom: '1.5rem' }}>BuildFlow respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
                
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>1. Important information and who we are</h3>
                <p style={{ marginBottom: '1.5rem' }}>BuildFlow is the controller and responsible for your personal data (collectively referred to as "Company", "we", "us" or "our" in this privacy policy).</p>
                
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>2. The data we collect about you</h3>
                <p style={{ marginBottom: '1.5rem' }}>Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                <ul style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                    <li>Identity Data includes first name, last name, username or similar identifier.</li>
                    <li>Contact Data includes billing address, delivery address, email address and telephone numbers.</li>
                    <li>Technical Data includes internet protocol (IP) address, your login data, browser type and version.</li>
                </ul>
            </div>
        </div>
    );
};

export default Privacy;
