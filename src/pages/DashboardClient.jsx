import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { usePolling } from '../hooks/usePolling';
import {
    FolderKanban, Activity, CheckCircle, MapPin, Calendar, DollarSign,
    Plus, FileText, Send, User, CheckCircle2, FileSignature, Globe, ShieldCheck, ListTodo
} from 'lucide-react';
import FileGallery from '../components/FileGallery';
import ActivityFeed from '../components/ActivityFeed';
import { usePrevious } from '../hooks/usePrevious';

const DashboardClient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentTab = ['#overview', '#projects'].includes(location.hash) ? location.hash : '#overview';
    
    const { addToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [requests, setRequests] = useState([]);
    const [tasksList, setTasksList] = useState([]); // Needed for progress calculation
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        project_type: 'Residential',
        location: '',
        estimated_budget: '',
        timeline: '',
        description: '',
        priority: 'Medium'
    });

    const fetchData = async () => {
        try {
            const user = JSON.parse(sessionStorage.getItem('user_info') || '{}');
            const [projData, reqData, tasksData] = await Promise.all([
                apiFetch('/projects/'),
                apiFetch('/project-requests/'),
                apiFetch('/tasks/')
            ]);
            
            if (projData && !projData.error) setProjects(projData);
            if (tasksData && !tasksData.error) setTasksList(tasksData);
            if (reqData && !reqData.error) {
                setRequests(reqData.filter(r => r.submitted_by === user.id || !user.id));
            }
        } catch (e) {
            console.error("Error fetching data", e);
        }
        setLoading(false);
    };

    usePolling(fetchData, 30000);

    const prevTasksList = usePrevious(tasksList);
    useEffect(() => {
        if (prevTasksList && tasksList.length > 0) {
            tasksList.forEach(t => {
                const pt = prevTasksList.find(pt => pt.id === t.id);
                if (pt && pt.status !== 'Completed' && t.status === 'Completed') {
                    addToast(`Task completed in project: ${t.title}`, 'success');
                }
            });
        }
    }, [tasksList]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.hash]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = JSON.parse(sessionStorage.getItem('user_info') || '{}');
            const submitData = { ...formData, submitted_by: user.user_id || 1 };
            if (submitData.estimated_budget) {
                submitData.estimated_budget = submitData.estimated_budget.replace(/,/g, '');
            }
            await apiFetch('/project-requests/', {
                method: 'POST',
                body: JSON.stringify(submitData)
            });
            addToast('Project request submitted successfully!', 'success');
            setShowModal(false);
            setFormData({
                name: '', project_type: 'Residential', location: '',
                estimated_budget: '', timeline: '', description: '', priority: 'Medium'
            });
            fetchData();
        } catch (error) {
            addToast('Failed to submit request', 'error');
        }
    };

    // Derived Statistics
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const totalRequests = requests.length;
    
    // Render Helpers
    const renderOverview = () => (
        <div className="tab-pane reveal-fade slide-up">
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Here is a high-level summary of your investments and operations.</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Active Projects</span>
                        <Activity size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{activeProjects}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Completed Projects</span>
                        <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{completedProjects}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Project Requests</span>
                        <FileSignature size={24} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{totalRequests}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button className="btn outline-btn" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }} onClick={() => setShowModal(true)}>
                            <Plus size={24} style={{ color: 'var(--accent)' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Request Project</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start a new site consultation</span>
                        </button>
                        <button className="btn outline-btn" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }} onClick={() => navigate('/dashboard-client#projects')}>
                            <FolderKanban size={24} style={{ color: 'var(--success)' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>View Workspace</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Access active project timelines</span>
                        </button>
                    </div>
                </div>
                
                <div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
                    <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.6rem', borderRadius: '50%' }}>
                                    <CheckCircle2 size={16} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Logged In</h4>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Just now</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProjects = () => (
        <div className="tab-pane reveal-fade slide-up">
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FolderKanban size={36} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                    <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>My Projects</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>View and track your assigned projects.</p>
                </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {projects.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No projects assigned yet.</p> :
                 projects.map(project => {
                    const pTasks = tasksList.filter(t => t.project === project.id);
                    const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
                    const progress = pTasks.length === 0 ? 0 : Math.round((pCompleted / pTasks.length) * 100);

                    return (
                        <div key={project.id} className="dash-card hover-lift" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => navigate(`/client-project/${project.id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>{project.title}</h3>
                                <span className={`status-pill ${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'active' : 'muted'}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> {project.location || 'Unknown Location'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Due: {project.deadline || 'Ongoing'}</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Project Completion</span>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{progress}%</span>
                                </div>
                            </div>
                            
                            <button className="btn outline-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                                View Full Workspace &rarr;
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="dashboard-header dash-card" style={{ marginTop: '4rem', marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ListTodo size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>My Project Requests</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Manage and track your project requests.</p>
                    </div>
                </div>
                <button className="btn accent-btn" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> New Request
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Location</th>
                            <th>Timeline</th>
                            <th>Submitted Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No requests submitted yet.</td></tr>
                        ) : (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{req.name}</td>
                                    <td>{req.location}</td>
                                    <td>{req.timeline}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-pill ${req.status === 'Approved' ? 'success' : req.status === 'Under Review' ? 'warning' : 'muted'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );




    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-dark)' }}><div className="loader"></div></div>;
    }

    return (
        <div style={{ padding: '8rem 2rem 4rem 2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>
            {currentTab === '#overview' && renderOverview()}
            {currentTab === '#projects' && renderProjects()}

            {/* MODAL */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'var(--bg-dark)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-hover)', boxShadow: 'var(--card-shadow-hover)' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Request a New Project</h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <input placeholder="Project Name" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input placeholder="Project Type" required style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.project_type} onChange={e => setFormData({...formData, project_type: e.target.value})} />
                                    <input placeholder="Location" required style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="text" placeholder="Estimated Budget (₹)" required style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.estimated_budget} onChange={e => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setFormData({...formData, estimated_budget: raw ? Number(raw.replace(/,/g,'')).toLocaleString('en-IN') : ''}) }} />
                                    <input placeholder="Expected Timeline (e.g. 6 Months)" required style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
                                </div>
                                <textarea placeholder="Description & Requirements" rows="4" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn secondary-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn accent-btn" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Send size={16} /> Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardClient;
