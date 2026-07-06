import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { usePolling } from '../hooks/usePolling';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

const InspectionsPanel = ({ projectId }) => {
    const [inspections, setInspections] = useState([]);

    const fetchInspections = async () => {
        try {
            const data = await apiFetch('/inspections/');
            setInspections(data.filter(i => i.project === parseInt(projectId)).sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (e) {
            console.error("Error fetching inspections", e);
        }
    };

    usePolling(fetchInspections, 15000);

    const getStatusIcon = (status) => {
        if (status === 'Passed') return <ShieldCheck size={28} color="var(--success)" />;
        if (status === 'Failed') return <ShieldAlert size={28} color="var(--error)" />;
        return <AlertTriangle size={28} color="var(--warning)" />;
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Site Quality & Safety Inspections</h2>
            
            <div className="dashboard-grid">
                {inspections.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No inspections recorded yet.</p>
                ) : (
                    inspections.map(inspection => (
                        <div key={inspection.id} style={{ 
                            background: 'var(--bg-card)', 
                            border: `1px solid ${inspection.status === 'Passed' ? 'rgba(16,185,129,0.3)' : (inspection.status === 'Failed' ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)')}`, 
                            borderRadius: '16px', 
                            padding: '1.5rem',
                            boxShadow: 'var(--card-shadow)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{inspection.type}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                                        {new Date(inspection.date).toLocaleDateString()}
                                    </p>
                                </div>
                                {getStatusIcon(inspection.status)}
                            </div>
                            
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Findings</h4>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1rem' }}>{inspection.findings}</p>
                                
                                {inspection.corrective_actions && (
                                    <>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Corrective Actions</h4>
                                        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--warning)' }}>{inspection.corrective_actions}</p>
                                    </>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inspector ID: {inspection.inspector || 'System'}</span>
                                <span className={`status-badge status-${inspection.status.toLowerCase().replace(/ /g, '-')}`}>
                                    {inspection.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InspectionsPanel;
