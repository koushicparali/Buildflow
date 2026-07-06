import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch, apiFetchBlob } from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FolderKanban, Activity, CheckCircle, ListTodo, ClipboardList,
    TrendingUp, MapPin, Calendar, DollarSign, Clock, Plus,
    UserPlus, Edit2, Trash2, FileText, Download, Eye, CheckCircle2, Bell, Globe, ShieldCheck
} from 'lucide-react';
import FileGallery from '../components/FileGallery';
import ActivityFeed from '../components/ActivityFeed';
import CommentsPanel from '../components/CommentsPanel';
import ChangeRequestsPanel from '../components/ChangeRequestsPanel';
import { usePolling } from '../hooks/usePolling';
import { usePrevious } from '../hooks/usePrevious';

const DashboardProjectManager = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const currentTab = ['#overview', '#projects', '#tasks'].includes(location.hash) ? location.hash : '#overview';

    const [projectsList, setProjectsList] = useState([]);
    const [tasksList, setTasksList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [notificationsList, setNotificationsList] = useState([]);
    const [upcomingDeadlinesList, setUpcomingDeadlinesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjectForEcosystem, setSelectedProjectForEcosystem] = useState('');

    // Modals state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [editTask, setEditTask] = useState(null);
    const [taskBudgetInput, setTaskBudgetInput] = useState('');

    const fetchData = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const [usersRes, projectsRes, tasksRes, notificationsRes, deadlinesRes] = await Promise.all([
                apiFetch('/users/').catch(e => ({ error: e.message })),
                apiFetch('/projects/').catch(e => ({ error: e.message })),
                apiFetch('/tasks/').catch(e => ({ error: e.message })),
                apiFetch('/notifications/').catch(e => ({ error: e.message })),
                apiFetch('/upcoming-deadlines/').catch(e => ({ error: e.message }))
            ]);

            if (usersRes && !usersRes.error) setUsersList(usersRes);
            if (projectsRes && !projectsRes.error) setProjectsList(projectsRes);
            if (tasksRes && !tasksRes.error) setTasksList(tasksRes);
            if (notificationsRes && !notificationsRes.error) setNotificationsList(notificationsRes);
            if (deadlinesRes && !deadlinesRes.error) setUpcomingDeadlinesList(deadlinesRes.tasks || []);
        } catch (e) {
            console.error("Error fetching data:", e);
        }
        if (!isPolling) setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    usePolling(() => {
        fetchData(true);
    }, 30000);

    const prevNotificationsList = usePrevious(notificationsList);
    const initialLoadDone = React.useRef(false);

    useEffect(() => {
        if (!initialLoadDone.current && notificationsList.length > 0) {
            initialLoadDone.current = true;
            return;
        }
        
        if (initialLoadDone.current && prevNotificationsList && notificationsList.length > prevNotificationsList.length) {
            const newNotifs = notificationsList.filter(n => !prevNotificationsList.find(pn => pn.id === n.id));
            newNotifs.forEach(n => {
                addToast(n.message, 'info');
            });
        }
    }, [notificationsList]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.hash]);

    // Derived Statistics
    const totalProjects = projectsList.length;
    const activeProjects = projectsList.filter(p => p.status === 'In Progress').length;
    const completedProjects = projectsList.filter(p => p.status === 'Completed').length;
    const pendingTasks = tasksList.filter(t => t.status !== 'Completed').length;
    const completedTasks = tasksList.filter(t => t.status === 'Completed').length;

    const overallProgress = totalProjects === 0 ? 0 : Math.round(
        projectsList.reduce((acc, p) => {
            const pTasks = tasksList.filter(t => t.project === p.id);
            const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
            const progress = pTasks.length === 0 ? 0 : (pCompleted / pTasks.length) * 100;
            return acc + progress;
        }, 0) / totalProjects
    );

    // Handlers
    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        data.created_by = user?.user_id || 1;

        try {
            if (editProject) {
                await apiFetch(`/projects/${editProject.id}/`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                addToast('Project updated successfully', 'success');
            } else {
                await apiFetch('/projects/', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                addToast('Project created successfully', 'success');
            }
            setShowProjectModal(false);
            setEditProject(null);
            fetchData();
        } catch (err) {
            addToast('Failed to save project', 'error');
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (data.budget) {
            data.budget = data.budget.replace(/,/g, '');
        }

        try {
            if (editTask) {
                await apiFetch(`/tasks/${editTask.id}/`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
            } else {
                await apiFetch('/tasks/', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            setShowTaskModal(false);
            setEditTask(null);
            fetchData();
        } catch (err) {
            alert('Failed to save task');
        }
    };

    const handleDeleteProject = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await apiFetch(`/projects/${id}/`, { method: 'DELETE' });
                addToast('Project deleted', 'success');
                fetchData();
            } catch (err) {
                addToast('Failed to delete project', 'error');
            }
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await apiFetch(`/tasks/${id}/`, { method: 'DELETE' });
                addToast('Task deleted', 'success');
                fetchData();
            } catch (err) {
                addToast('Failed to delete task', 'error');
            }
        }
    };

    // Render Helpers
    const renderOverview = () => (
        <div className="tab-pane reveal-fade slide-up">
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>Overview</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Welcome back, PM. Here is the high-level summary of all operations.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn secondary-btn" onClick={() => { setEditProject(null); setShowProjectModal(true); }}>
                        <Plus size={18} /> Create Project
                    </button>
                    <button className="btn accent-btn" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
                        <UserPlus size={18} /> Assign Task
                    </button>
                </div>
            </div>

            {/* TOP STATISTICS */}
            <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Total Projects</span>
                        <FolderKanban size={24} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{totalProjects}</div>
                        <span style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}><TrendingUp size={14} /> +2%</span>
                    </div>
                </div>

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
                        <span className="card-title">Pending Tasks</span>
                        <ListTodo size={24} style={{ color: 'var(--warning)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{pendingTasks}</div>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Completed Tasks</span>
                        <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{completedTasks}</div>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Overall Progress</span>
                        <ClipboardList size={24} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="value-container" style={{ marginTop: '1rem', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <div className="value" style={{ fontSize: '2.5rem', fontWeight: '800' }}>{overallProgress}%</div>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn outline-btn" onClick={() => { setEditProject(null); setShowProjectModal(true); }}><Plus size={16} /> Create Project</button>
                    <button className="btn outline-btn" onClick={() => { setEditTask(null); setShowTaskModal(true); }}><Edit2 size={16} /> Assign Task</button>
                    <button className="btn outline-btn"><FileText size={16} /> Generate Report</button>
                    <button className="btn outline-btn"><FolderKanban size={16} /> View All Projects</button>
                </div>
            </div>

            {/* UPCOMING DEADLINES */}
            <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Upcoming Deadlines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {upcomingDeadlinesList.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No upcoming deadlines in the next 30 days.</p> :
                     upcomingDeadlinesList.slice(0, 4).map(dl => {
                        const today = new Date();
                        const dlDate = new Date(dl.deadline);
                        const diffTime = dlDate - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const remainingText = diffDays > 0 ? `Due in ${diffDays} days` : diffDays === 0 ? 'Due today' : `Overdue by ${Math.abs(diffDays)} days`;

                        return (
                        <div key={dl.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1rem' }}>{dl.title}</h4>
                                <span className={`status-pill ${dl.priority === 'Critical' ? 'error' : dl.priority === 'High' ? 'warning' : 'active'}`}>{dl.priority || 'Medium'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <UserPlus size={14} /> {usersList.find(u => u.id === dl.assigned_engineer)?.username || 'Unassigned'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                <Clock size={14} /> {remainingText}
                            </div>
                        </div>
                    )})}
                </div>
            </div>
        </div>
    );

    const renderProjects = () => (
        <div className="tab-pane reveal-fade slide-up">
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderKanban size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>Project Overview</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Monitor and manage all active projects.</p>
                    </div>
                </div>
                <button className="btn accent-btn" onClick={() => { setEditProject(null); setShowProjectModal(true); }}>
                    <Plus size={18} /> Create New Project
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {projectsList.map(project => {
                    const pTasks = tasksList.filter(t => t.project === project.id);
                    const pCompleted = pTasks.filter(t => t.status === 'Completed').length;
                    const progress = pTasks.length === 0 ? 0 : Math.round((pCompleted / pTasks.length) * 100);

                    return (
                        <div key={project.id} className="dash-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>{project.title}</h3>
                                <span className={`status-pill ${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'active' : 'muted'}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Location: {project.location || 'New York HQ'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Budget: ₹{Number(project.budget || 0).toLocaleString('en-IN')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus size={16} /> PM: {usersList.find(u => u.id === project.created_by)?.username || 'Unknown'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Due: {project.deadline || 'Ongoing'}</span>
                            </div>

                            {project.description && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={16} /> Project Details
                                    </h4>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                        {project.description}
                                    </p>
                                </div>
                            )}

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{progress}%</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }} onClick={() => navigate(`/client-project/${project.id}`)}><Eye size={16} /> View</button>
                                <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }} onClick={() => { setEditProject(project); setShowProjectModal(true); }}><Edit2 size={16} /> Edit</button>
                                <button className="btn outline-btn" style={{ padding: '0.6rem' }} onClick={() => handleDeleteProject(project.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderTasks = () => (
        <div className="tab-pane reveal-fade slide-up">
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ListTodo size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>Task Management</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Assign and monitor workflow progress.</p>
                    </div>
                </div>
                <button className="btn accent-btn" onClick={() => { setEditTask(null); setTaskBudgetInput(''); setShowTaskModal(true); }}>
                    <Plus size={18} /> Create Task
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Assigned Engineer</th>
                            <th>Project</th>
                            <th>Due Date</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasksList.map((task) => (
                            <tr key={task.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</td>
                                <td>{usersList.find(u => u.id === task.assigned_engineer)?.username || 'Unassigned'}</td>
                                <td>{projectsList.find(p => p.id === task.project)?.title || 'Unknown'}</td>
                                <td>{task.deadline || 'N/A'}</td>
                                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{parseFloat(task.budget || 0).toLocaleString('en-IN')}</td>
                                <td>
                                    <span className={`status-pill ${task.status === 'Completed' ? 'success' : task.status === 'Pending' ? 'muted' : 'active'}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        {task.image && (
                                            <a href={`http://localhost:8000${task.image}`} target="_blank" rel="noreferrer" className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', color: 'var(--success)' }} title="View Attachment">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                            </a>
                                        )}
                                        <button className="btn outline-btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => { setEditTask(task); setTaskBudgetInput(task.budget ? parseFloat(task.budget).toLocaleString('en-IN') : ''); setShowTaskModal(true); }}><Edit2 size={14} /></button>
                                        <button className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', color: 'var(--error)' }} onClick={() => handleDeleteTask(task.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
            {currentTab === '#tasks' && renderTasks()}

            {/* PROJECT MODAL */}
            {showProjectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'var(--bg-dark)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-hover)', boxShadow: 'var(--card-shadow-hover)' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-main)' }}>{editProject ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleProjectSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <input name="title" defaultValue={editProject?.title} placeholder="Project Name" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                <input name="location" placeholder="Location" defaultValue={editProject?.location} style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                <input name="budget" type="number" step="0.01" defaultValue={editProject?.budget} placeholder="Budget (₹)" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input name="start_date" type="date" placeholder="Start Date" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', colorScheme: 'dark' }} />
                                    <input name="deadline" type="date" defaultValue={editProject?.deadline} placeholder="End Date" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', colorScheme: 'dark' }} />
                                </div>
                                <select name="status" defaultValue={editProject?.status || "Planning"} required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Planning">Planning</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Delayed">Delayed</option>
                                </select>
                                <textarea name="description" defaultValue={editProject?.description} placeholder="Description (Details)" rows="3" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn secondary-btn" onClick={() => setShowProjectModal(false)}>Cancel</button>
                                <button type="submit" className="btn accent-btn">Save Project</button>
                            </div>
                        </form>

                        {editProject && (
                            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)' }}>
                                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Workspace & Chats</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <FileGallery projectId={editProject.id} user={user} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                                        <CommentsPanel projectId={editProject.id} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                                        <ChangeRequestsPanel projectId={editProject.id} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TASK MODAL */}
            {showTaskModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'var(--bg-dark)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-hover)', boxShadow: 'var(--card-shadow-hover)' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-main)' }}>{editTask ? 'Edit Task' : 'Assign New Task'}</h2>
                        <form onSubmit={handleTaskSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <input name="title" defaultValue={editTask?.title} placeholder="Task Name" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />

                                <select name="project" defaultValue={editTask?.project} required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="">Select Project...</option>
                                    {projectsList.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>

                                <select name="assigned_engineer" defaultValue={editTask?.assigned_engineer} required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="">Assign Engineer...</option>
                                    {usersList.filter(u => u.role === 'engineer').map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                                </select>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select name="priority" defaultValue={editTask?.priority || "Medium"} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                    <input name="deadline" type="date" defaultValue={editTask?.deadline} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', colorScheme: 'dark' }} />
                                    <input name="budget" type="text" value={taskBudgetInput} onChange={(e) => { const raw = e.target.value.replace(/[^0-9.]/g, ''); setTaskBudgetInput(raw ? Number(raw.replace(/,/g,'')).toLocaleString('en-IN') : ''); }} placeholder="Allocated Budget (₹)" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                </div>

                                <select name="status" defaultValue={editTask?.status || "Pending"} required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                                <textarea name="description" defaultValue={editTask?.description} placeholder="Description" rows="3" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}></textarea>
                                
                                {editTask?.invoice_id && (
                                    <button 
                                        type="button" 
                                        className="btn outline-btn" 
                                        style={{ marginTop: '1rem', width: '100%', padding: '0.8rem', textAlign: 'center' }}
                                        onClick={async () => {
                                            try {
                                                const blob = await apiFetchBlob(`/invoices/${editTask.invoice_id}/pdf/`);
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
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn secondary-btn" onClick={() => setShowTaskModal(false)}>Cancel</button>
                                <button type="submit" className="btn accent-btn">Save Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardProjectManager;
