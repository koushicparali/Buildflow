import React from 'react';

const QuoteModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Thank you! Form submitted successfully.");
        onClose();
    };

    return (
        <div className="modal active" onClick={(e) => { if(e.target.className === 'modal active') onClose(); }}>
            <div className="modal-content">
                <span className="close-btn" onClick={onClose}>&times;</span>
                <h2>Request a Quote</h2>
                <form id="quoteForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" placeholder="Enter your name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" placeholder="Enter your email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="company">Company</label>
                        <input type="text" id="company" placeholder="Enter your company name" required />
                    </div>
                    <button type="submit" className="btn submit-btn">Submit Request</button>
                </form>
            </div>
        </div>
    );
};

export default QuoteModal;
