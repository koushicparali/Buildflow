import React, { useState } from 'react';

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "What is BuildFlow?",
            answer: "BuildFlow is a comprehensive construction management platform designed to streamline communication, task assignment, and progress tracking across your entire site workforce."
        },
        {
            question: "How does the task assignment work?",
            answer: "Admins can create tasks in the dashboard and assign them to specific staff members. Staff members receive notifications on their devices and can update the task status in real-time as they work."
        },
        {
            question: "Can clients view project progress?",
            answer: "Yes, we offer a dedicated Client Dashboard where clients can log in to view high-level project updates, recent activity, billing status, and communicate with the support team."
        },
        {
            question: "Is there a mobile app?",
            answer: "BuildFlow is a fully responsive web application, meaning it works seamlessly on any mobile device's web browser without needing to download a separate app."
        }
    ];

    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh' }}>
            <section id="faq" className="faq-section reveal fade-up" style={{ padding: '4rem 10%', backgroundColor: 'var(--bg-alt)' }}>
                <div className="section-header">
                    <h2>Frequently Asked Questions</h2>
                    <p>Find answers to common questions about BuildFlow.</p>
                </div>
                
                <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {faqs.map((faq, index) => (
                        <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
                            <button className="faq-question" onClick={() => toggleFAQ(index)}>
                                {faq.question}
                            </button>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FAQ;
