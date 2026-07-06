import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { usePolling } from '../hooks/usePolling';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

const MilestonesPanel = ({ projectId }) => {
    const [milestones, setMilestones] = useState([]);

    const fetchMilestones = async () => {
        try {
            const data = await apiFetch('/milestones/');
            // Assuming API returns all milestones that user has access to, filter by project
            setMilestones(data.filter(m => m.project === parseInt(projectId)).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
        } catch (e) {
            console.error("Error fetching milestones", e);
        }
    };

    usePolling(fetchMilestones, 15000);

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Project Milestones</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {/* Vertical Timeline Line */}
                <div style={{ position: 'absolute', left: '24px', top: '20px', bottom: '20px', width: '2px', background: 'var(--border-light)', zIndex: 0 }}></div>

                {milestones.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>No milestones defined for this project.</p>
                ) : (
                    milestones.map((milestone, index) => {
                        const isCompleted = milestone.status === 'Completed';
                        const isInProgress = milestone.status === 'In Progress';
                        
                        return (
                            <div key={milestone.id} style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                                {/* Timeline Node */}
                                <div style={{ 
                                    width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                                    background: isCompleted ? 'var(--success)' : (isInProgress ? 'var(--accent)' : 'var(--bg-card)'),
                                    border: `2px solid ${isCompleted ? 'var(--success)' : (isInProgress ? 'var(--accent)' : 'var(--border-light)')}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isInProgress ? '0 0 15px var(--accent-glow)' : 'none',
                                    color: isCompleted || isInProgress ? '#fff' : 'var(--text-muted)'
                                }}>
                                    {isCompleted ? <CheckCircle size={24} /> : <Clock size={24} />}
                                </div>
                                
                                {/* Milestone Card */}
                                <div style={{ 
                                    flex: 1, background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', 
                                    border: '1px solid var(--border-light)',
                                    boxShadow: 'var(--card-shadow)',
                                    opacity: isCompleted ? 0.8 : 1
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{milestone.title}</h3>
                                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <Calendar size={14} /> Due: {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'TBD'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`status-badge status-${milestone.status.toLowerCase().replace(' ', '-')}`}>
                                            {milestone.status}
                                        </span>
                                    </div>
                                    
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                            <span>{milestone.completion_percentage}%</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                width: `${milestone.completion_percentage}%`, 
                                                background: isCompleted ? 'var(--success)' : 'var(--accent)',
                                                transition: 'width 1s ease-in-out'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default MilestonesPanel;
