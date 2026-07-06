import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
    const { logout } = useAuth();
    
    return (
        <div style={{ paddingTop: '100px', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '500px', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                    <Clock size={48} style={{ color: 'var(--accent)' }} />
                </div>
                
                <h2 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.8rem' }}>Account Pending Approval</h2>
                
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Your account has been successfully created! However, an administrator needs to review your request and assign you a role before you can access the dashboard.
                </p>
                
                <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                    Please check back later, or contact support if you believe this is an error.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link to="/" className="btn outline-btn" style={{ textDecoration: 'none', padding: '0.8rem 2rem' }}>
                        Go to Home
                    </Link>
                    <button onClick={logout} className="btn primary-btn" style={{ padding: '0.8rem 2rem' }}>
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
