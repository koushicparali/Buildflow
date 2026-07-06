import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, apiFetchBlob } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';
import { ArrowLeft, DollarSign, Flag, ListTodo, FolderOpen, FileSignature, MessageSquare, MapPin } from 'lucide-react';

import ChangeRequestsPanel from '../components/ChangeRequestsPanel';
import ProjectFilesPanel from '../components/ProjectFilesPanel';
import CommentsPanel from '../components/CommentsPanel';
import FinancialsPanel from '../components/FinancialsPanel';
import MilestonesPanel from '../components/MilestonesPanel';

const ClientProjectWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [project, setProject] = useState(null);
    const [activeTab, setActiveTab] = useState('financials');

    const fetchProjectDetails = async () => {
        try {
            const data = await apiFetch(`/projects/${id}/`);
            setProject(data);
        } catch (e) {
            console.error("Error fetching project details", e);
        }
    };

    usePolling(fetchProjectDetails, 10000); // Poll every 10s

    if (!project) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading project...</div>;

    return (
        <div style={{ minHeight: '100vh', padding: '120px 5% 40px 5%' }}>
            <button 
                className="btn hover-lift" 
                onClick={() => navigate(-1)} 
                style={{ 
                    marginBottom: '2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '50px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontWeight: '600',
                    boxShadow: 'var(--card-shadow)',
                    cursor: 'pointer'
                }}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{project.title}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Project Workspace</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span className={`status-badge status-${project.status.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 'bold' }}>
                        {project.status}
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '3rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '50px', border: '1px solid var(--border-light)', width: 'fit-content', boxShadow: 'var(--card-shadow)' }}>
                {[
                    { id: 'financials', label: 'Financials', icon: <DollarSign size={16} /> },
                    { id: 'tasks', label: 'Tasks Completed', icon: <ListTodo size={16} /> },
                    { id: 'files', label: 'File Center', icon: <FolderOpen size={16} /> },
                    { id: 'changes', label: 'Change Requests', icon: <FileSignature size={16} /> },
                    { id: 'comments', label: 'Discussions', icon: <MessageSquare size={16} /> }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        className={`btn hover-lift ${activeTab === tab.id ? 'primary-btn' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 1.5rem',
                            borderRadius: '50px',
                            fontWeight: '600',
                            background: activeTab !== tab.id ? 'transparent' : undefined,
                            color: activeTab !== tab.id ? 'var(--text-muted)' : undefined,
                            border: 'none',
                            boxShadow: activeTab !== tab.id ? 'none' : 'var(--card-shadow)'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'financials' && <FinancialsPanel projectId={id} />}
            {activeTab === 'milestones' && <MilestonesPanel projectId={id} />}
            
            {activeTab === 'tasks' && (
                <section id="tasks" style={{ marginTop: '2rem' }}>
                    <h2>Tasks & Execution (Read-Only)</h2>
                    <div className="dashboard-grid" style={{ marginTop: '1rem' }}>
                        {project.tasks && project.tasks.map(task => (
                            <div key={task.id} className="task-card">
                                <div className="task-header">
                                    <h3>{task.title}</h3>
                                    <span className={`status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{task.description}</p>
                                {task.image && (
                                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={`http://localhost:8000${task.image}`} alt="Task Attachment" loading="lazy" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '150px', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '0.9rem' }}>Progress: {task.progress}%</span>
                                    {task.budget && (
                                        <span style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                                            ₹{parseFloat(task.budget).toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                                {task.invoice_id && (
                                    <button 
                                        type="button" 
                                        className="btn outline-btn" 
                                        style={{ marginTop: '1.5rem', width: '100%', padding: '0.8rem', textAlign: 'center' }}
                                        onClick={async () => {
                                            try {
                                                const blob = await apiFetchBlob(`/invoices/${task.invoice_id}/pdf/`);
                                                const url = URL.createObjectURL(blob);
                                                window.open(url, '_blank');
                                            } catch (err) {
                                                addToast('Failed to load invoice', 'error');
                                            }
                                        }}
                                    >
                                        View Invoice (PDF)
                                    </button>
                                )}
                            </div>
                        ))}
                        {(!project.tasks || project.tasks.length === 0) && <p>No active tasks.</p>}
                    </div>
                </section>
            )}

            {activeTab === 'files' && <ProjectFilesPanel projectId={id} />}
            {activeTab === 'changes' && <ChangeRequestsPanel projectId={id} />}
            {activeTab === 'comments' && <CommentsPanel projectId={id} />}

        </div>
    );
};

export default ClientProjectWorkspace;
