import React from 'react';

const Terms = () => {
    return (
        <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '100px 2rem 4rem 2rem' }}>
            <h1 style={{ marginBottom: '2rem' }}>Terms & Conditions</h1>
            <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '1rem' }}>Last updated: June 2026</p>
                <p style={{ marginBottom: '1.5rem' }}>Please read these terms and conditions carefully before using Our Service.</p>
                
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Interpretation and Definitions</h3>
                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Interpretation</h4>
                <p style={{ marginBottom: '1.5rem' }}>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
                
                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Acknowledgment</h3>
                <p style={{ marginBottom: '1.5rem' }}>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
                <p style={{ marginBottom: '1.5rem' }}>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
            </div>
        </div>
    );
};

export default Terms;
