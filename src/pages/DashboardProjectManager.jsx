import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLocation } from 'react-router-dom';
import {
    FolderKanban, Activity, CheckCircle, ListTodo, ClipboardList,
    TrendingUp, MapPin, Calendar, DollarSign, Clock, Plus,
    UserPlus, Edit2, Trash2, FileText, Download, Eye, CheckCircle2, Bell
} from 'lucide-react';

const DashboardProjectManager = () => {
    const { user } = useAuth();
    const location = useLocation();
    const currentTab = location.hash || '#overview';

    const [projectsList, setProjectsList] = useState([]);
    const [tasksList, setTasksList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [notificationsList, setNotificationsList] = useState([]);
    const [upcomingDeadlinesList, setUpcomingDeadlinesList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [editTask, setEditTask] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, projectsRes, tasksRes, notificationsRes, deadlinesRes] = await Promise.all([
                apiFetch('/users/'),
                apiFetch('/projects/'),
                apiFetch('/tasks/'),
                apiFetch('/notifications/'),
                apiFetch('/upcoming-deadlines/')
            ]);

            if (usersRes && !usersRes.error) setUsersList(usersRes);
            if (projectsRes && !projectsRes.error) setProjectsList(projectsRes);
            if (tasksRes && !tasksRes.error) setTasksList(tasksRes);
            if (notificationsRes && !notificationsRes.error) setNotificationsList(notificationsRes);
            if (deadlinesRes && !deadlinesRes.error) setUpcomingDeadlinesList(deadlinesRes.tasks || []);
        } catch (e) {
            console.error("Error fetching data:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

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
            } else {
                await apiFetch('/projects/', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
            }
            setShowProjectModal(false);
            setEditProject(null);
            fetchData();
        } catch (err) {
            alert('Failed to save project');
        }
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

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

    const handleDeleteTask = async (id) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            await apiFetch(`/tasks/${id}/`, { method: 'DELETE' });
            fetchData();
        }
    };

    // Render Helpers
    const renderOverview = () => (
        <div className="tab-pane reveal active fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Overview</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, PM. Here is the high-level summary of all operations.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn accent-btn" onClick={() => { setEditProject(null); setShowProjectModal(true); }}>
                        <Plus size={18} /> Create Project
                    </button>
                    <button className="btn secondary-btn" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
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
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
                        <div style={{ width: `${overallProgress}%`, background: 'var(--accent-gradient)', height: '100%', borderRadius: '4px' }}></div>
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
        <div className="tab-pane reveal active fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Project Overview</h2>
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
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> New York HQ (Mock)</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Budget: ₹{Number(project.budget || 0).toLocaleString('en-IN')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserPlus size={16} /> PM: {usersList.find(u => u.id === project.created_by)?.username || 'Unknown'}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16} /> Due: {project.deadline || 'Ongoing'}</span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{progress}%</span>
                                </div>
                                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, background: 'var(--accent-gradient)', height: '100%', borderRadius: '4px' }}></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }}><Eye size={16} /> Details</button>
                                <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }} onClick={() => { setEditProject(project); setShowProjectModal(true); }}><Edit2 size={16} /> Edit</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderTasks = () => (
        <div className="tab-pane reveal active fade-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>Task Management</h2>
                <button className="btn accent-btn" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
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
                                <td>
                                    <span className={`status-pill ${task.status === 'Completed' ? 'success' : task.status === 'Pending' ? 'muted' : 'active'}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button className="btn outline-btn" style={{ padding: '0.4rem 0.8rem' }} onClick={() => { setEditTask(task); setShowTaskModal(true); }}><Edit2 size={14} /></button>
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

    const generateReportPDF = (type) => {
        alert(`${type} generation feature is coming soon!`);
    };

    const renderReports = () => (
        <div className="tab-pane reveal active fade-up">
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Reports Section</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {['Weekly Project Report', 'Monthly Project Report', 'Weekly Task Report', 'Monthly Task Report'].map(report => (
                    <div key={report} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}><FileText size={24} style={{ color: 'var(--accent)' }} /></div>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem' }}>{report}</h3>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem', opacity: 0.7, cursor: 'not-allowed' }} onClick={() => generateReportPDF(report)}>
                                <FileText size={16} /> Feature Coming Soon
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Recent Activities</h3>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-light)', padding: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                        { icon: <Plus size={16} />, title: 'Project Created', desc: 'Valley Hospital Wing initialized.', time: '2 hours ago' },
                        { icon: <UserPlus size={16} />, title: 'Task Assigned', desc: 'Assigned "Foundation Pour" to Engineer Sarah.', time: '5 hours ago' },
                        { icon: <CheckCircle size={16} />, title: 'Task Completed', desc: 'Site Survey finished ahead of schedule.', time: '1 day ago' },
                        { icon: <FileText size={16} />, title: 'Report Generated', desc: 'Monthly Progress Report downloaded.', time: '2 days ago' }
                    ].map((activity, i) => (
                        <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <div style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '0.8rem', borderRadius: '50%' }}>
                                {activity.icon}
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1.05rem', marginBottom: '0.2rem' }}>{activity.title}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{activity.desc}</p>
                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{activity.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderAlerts = () => (
        <div className="tab-pane reveal active fade-up">
            <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Alerts & Notifications</h2>
            
            {notificationsList.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px dashed var(--border-light)' }}>
                    <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No new alerts</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {notificationsList.map(notif => (
                        <div key={notif.id} style={{ 
                            background: 'var(--bg-card)', 
                            padding: '1.5rem', 
                            borderRadius: '16px', 
                            border: `1px solid ${notif.escalation_level > 1 ? 'var(--error)' : 'var(--border-light)'}`,
                            display: 'flex', 
                            gap: '1.5rem', 
                            alignItems: 'center' 
                        }}>
                            <div style={{ 
                                background: notif.escalation_level > 1 ? 'rgba(255, 71, 87, 0.1)' : 'var(--accent-glow)', 
                                color: notif.escalation_level > 1 ? 'var(--error)' : 'var(--accent)', 
                                padding: '1rem', 
                                borderRadius: '50%' 
                            }}>
                                <Bell size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                                    {notif.type} {notif.escalation_level > 0 && `(Escalation Level ${notif.escalation_level})`}
                                </h3>
                                <p style={{ color: 'var(--text-muted)' }}>{notif.message}</p>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textAlign: 'right' }}>
                                {new Date(notif.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
            {currentTab === '#reports' && renderReports()}
            {currentTab === '#alerts' && renderAlerts()}

            {/* PROJECT MODAL */}
            {showProjectModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'var(--bg-dark)', padding: '3rem', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-hover)', boxShadow: 'var(--card-shadow-hover)' }}>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-main)' }}>{editProject ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleProjectSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <input name="title" defaultValue={editProject?.title} placeholder="Project Name" required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
                                <input name="location" placeholder="Location (Mock)" defaultValue="New York HQ" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }} />
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
                                <textarea name="description" defaultValue={editProject?.description} placeholder="Description" rows="3" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn secondary-btn" onClick={() => setShowProjectModal(false)}>Cancel</button>
                                <button type="submit" className="btn accent-btn">Save Project</button>
                            </div>
                        </form>
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
                                    {usersList.filter(u => u.role === 'engineer' || u.role === 'contractor').map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                                </select>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <select name="priority" defaultValue="Medium" style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                        <option value="Low">Low Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="High">High Priority</option>
                                    </select>
                                    <input name="deadline" type="date" defaultValue={editTask?.deadline} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)', colorScheme: 'dark' }} />
                                </div>

                                <select name="status" defaultValue={editTask?.status || "Pending"} required style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>

                                <textarea name="description" defaultValue={editTask?.description} placeholder="Description" rows="3" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}></textarea>
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
