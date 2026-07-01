import React, { useState } from 'react';

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState(''); // 'submitting', 'success', 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            const res = await fetch('http://localhost:8000/api/queries/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => setStatus(''), 5000);
            } else {
                setStatus('error');
                setTimeout(() => setStatus(''), 5000);
            }
        } catch (error) {
            console.error("Error submitting query:", error);
            setStatus('error');
            setTimeout(() => setStatus(''), 5000);
        }
    };
    return (
        <section id="query" className="query-section">
            <div className="section-header">
                <h2>Have a Question?</h2>
                <p>Send us your queries and we'll get back to you shortly.</p>
            </div>
            <div className="query-container">
                {status === 'success' && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid #10b981' }}>
                        Your query has been sent successfully! Our team will get back to you soon.
                    </div>
                )}
                {status === 'error' && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid #ef4444' }}>
                        Something went wrong. Please try again later.
                    </div>
                )}
                <form id="queryForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="q-name">Your Name</label>
                        <input type="text" id="q-name" placeholder="Enter your name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-email">Your Email</label>
                        <input type="email" id="q-email" placeholder="Enter your email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="q-message">Message</label>
                        <textarea id="q-message" placeholder="How can we help you?" rows="5" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="btn submit-btn" disabled={status === 'submitting'}>
                        {status === 'submitting' ? 'Sending...' : 'Send Query'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ContactForm;
