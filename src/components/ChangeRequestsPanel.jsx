import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';
import { useAuth } from '../context/AuthContext';

const ChangeRequestsPanel = ({ projectId }) => {
    const { addToast } = useToast();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'Medium'
    });

    const [selectedReq, setSelectedReq] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [pmRemarks, setPmRemarks] = useState('');
    const [extraFunds, setExtraFunds] = useState('');

    const fetchRequests = async () => {
        try {
            const allReqs = await apiFetch('/change-requests/');
            // Filter by project (assuming the API returns all for this user)
            setRequests(allReqs.filter(r => r.project === parseInt(projectId)));
        } catch (e) {
            console.error("Error fetching change requests:", e);
        }
    };

    usePolling(fetchRequests, 10000);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiFetch('/change-requests/', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    project: projectId,
                    submitted_by: user?.user_id || user?.id || 1
                })
            });
            addToast('Change Request submitted successfully!', 'success');
            setShowModal(false);
            setFormData({ title: '', description: '', priority: 'Medium' });
            fetchRequests();
        } catch (err) {
            addToast('Failed to submit request: ' + err.message, 'error');
        }
    };

    const handleFundResponse = async (id, action) => {
        try {
            await apiFetch(`/change-requests/${id}/respond_funds/`, {
                method: 'POST',
                body: JSON.stringify({ action })
            });
            addToast(action === 'approve' ? 'Funds approved!' : 'Funds rejected.', 'success');
            fetchRequests();
        } catch (err) {
            addToast('Failed to process response', 'error');
        }
    };

    const handlePMReview = async (e, actionType) => {
        e.preventDefault();
        try {
            if (actionType === 'reject' || actionType === 'approve_nocost') {
                await apiFetch(`/change-requests/${selectedReq.id}/`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status: actionType === 'reject' ? 'Rejected' : 'Approved',
                        pm_remarks: pmRemarks
                    })
                });
            } else if (actionType === 'approve_funds') {
                const cleanFunds = extraFunds.replace(/,/g, '');
                if (!cleanFunds || isNaN(cleanFunds)) {
                    addToast('Please enter a valid amount', 'warning');
                    return;
                }
                await apiFetch(`/change-requests/${selectedReq.id}/request_funds/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        extra_funds: cleanFunds,
                        remarks: pmRemarks
                    })
                });
            }
            addToast('Review submitted', 'success');
            setShowReviewModal(false);
            setPmRemarks('');
            setExtraFunds('');
            fetchRequests();
        } catch (err) {
            addToast('Failed to submit review', 'error');
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Change Requests</h2>
                {user?.role === 'client' && (
                    <button className="btn primary-btn" onClick={() => setShowModal(true)}>+ New Request</button>
                )}
            </div>
            
            <div className="table-container" style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <th style={{ padding: '1rem' }}>Title</th>
                            <th style={{ padding: '1rem' }}>Priority</th>
                            <th style={{ padding: '1rem' }}>Extra Funds</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Date</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No change requests found.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '1rem' }}>{req.title}</td>
                                    <td style={{ padding: '1rem' }}>{req.priority}</td>
                                    <td style={{ padding: '1rem', color: 'var(--accent)' }}>
                                        {req.extra_funds_requested > 0 ? `₹${parseFloat(req.extra_funds_requested).toLocaleString('en-IN')}` : '-'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`status-badge status-${req.status.toLowerCase().replace(/ /g, '-')}`}>{req.status}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {user?.role === 'client' && req.status === 'Pending Funds Approval' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleFundResponse(req.id, 'approve')} className="btn primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Approve Funds</button>
                                                <button onClick={() => handleFundResponse(req.id, 'reject')} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: 'var(--error)' }}>Reject</button>
                                            </div>
                                        )}
                                        {(user?.role === 'pm' || user?.role === 'admin') && req.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => { setSelectedReq(req); setShowReviewModal(true); }} className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Review</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Submit Change Request</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Title</label>
                                <input type="text" required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Description</label>
                                <textarea required rows="4" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Priority</label>
                                <select style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'var(--bg-main)', color: 'var(--text-main)' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn primary-btn" style={{ flex: 1 }}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showReviewModal && selectedReq && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Review Change Request</h2>
                        <h4 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>{selectedReq.title}</h4>
                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', color: 'var(--text-muted)' }}>
                            {selectedReq.description}
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>PM Remarks</label>
                            <textarea rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={pmRemarks} onChange={e => setPmRemarks(e.target.value)} placeholder="Add any comments..."></textarea>
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Request Extra Funds (₹)</label>
                            <input type="text" placeholder="Leave empty for no cost" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }} value={extraFunds} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setExtraFunds(raw ? Number(raw.replace(/,/g,'')).toLocaleString('en-IN') : ''); }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setShowReviewModal(false)} className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }}>Cancel</button>
                            <button onClick={(e) => handlePMReview(e, 'reject')} className="btn" style={{ flex: 1, padding: '0.6rem', background: 'var(--error)' }}>Reject</button>
                            <button onClick={(e) => handlePMReview(e, extraFunds ? 'approve_funds' : 'approve_nocost')} className="btn primary-btn" style={{ flex: 2, padding: '0.6rem' }}>{extraFunds ? 'Request Funds' : 'Approve (No Cost)'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeRequestsPanel;
