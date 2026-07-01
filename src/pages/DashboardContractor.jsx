import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLocation, Link } from 'react-router-dom';
import { recentActivities, upcomingDeadlines, notifications } from '../data/mockAdminData';
import { CheckCircle, ListTodo, Activity, FileUp, Building, HardHat } from 'lucide-react';

const DashboardContractor = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const [tasksList, setTasksList] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    
    // Modals
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    
    // Forms
    const [progressForm, setProgressForm] = useState({ progress: 0, status: 'Pending', remarks: '' });

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const allTasks = await apiFetch('/tasks/');
            const allProjects = await apiFetch('/projects/');
            
            if (allTasks && !allTasks.error) {
                const myTasks = allTasks.filter(t => t.assigned_contractor === user?.user_id);
                setTasksList(myTasks);
            }
            if (allProjects && !allProjects.error) {
                const myProjectIds = [...new Set(allTasks.filter(t => t.assigned_contractor === user?.user_id).map(t => t.project))];
                const myProjects = allProjects.filter(p => myProjectIds.includes(p.id));
                setProjectsList(myProjects);
            }
        } catch (e) {
            console.error("Error fetching contractor data:", e);
        }
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [location.hash]);

    const currentTab = location.hash || '#overview';

    // Stats
    const totalProjects = projectsList.length;
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.status === 'Completed').length;
    const incompleteTasks = tasksList.filter(t => t.status !== 'Completed').length;
    const avgProgress = totalTasks > 0 ? Math.round(tasksList.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks) : 0;
    
    // Handlers
    const handleUpdateProgress = async (e) => {
        e.preventDefault();
        try {
            await apiFetch(`/tasks/${selectedTask.id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ progress: progressForm.progress, status: progressForm.status })
            });
            setShowProgressModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to update task: " + err.message);
        }
    };

    const renderOverview = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <h2>Contractor Overview</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Welcome back, {user?.username}. Here are your active sites.</p>
            </div>

            <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Assigned Projects</span>
                    </div>
                    <div className="value-container">
                        <Building size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{totalProjects}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Assigned Tasks</span>
                    </div>
                    <div className="value-container">
                        <ListTodo size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{totalTasks}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Completed Tasks</span>
                    </div>
                    <div className="value-container">
                        <CheckCircle size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{completedTasks}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Incomplete Tasks</span>
                    </div>
                    <div className="value-container">
                        <Activity size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{incompleteTasks}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Task Completion</span>
                    </div>
                    <div className="value-container">
                        <Activity size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{avgProgress}%</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Link to="#projects" className="btn outline-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none' }}>View Assigned Projects</Link>
                        <Link to="#tasks" className="btn accent-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none' }}>Update Task Completion</Link>
                        <Link to="#tasks" className="btn outline-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none', gridColumn: 'span 2' }}>View Deadlines</Link>
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Upcoming Deadlines</h3>
                    <div className="deadline-list">
                        {upcomingDeadlines.map((dl) => (
                            <div key={dl.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{dl.taskName}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Due in {dl.remainingDays} days</div>
                                </div>
                                <span className={`status-pill ${dl.priority === 'Critical' ? 'error' : dl.priority === 'High' ? 'warning' : 'active'}`}>{dl.priority}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Recent Activities</h3>
                    <div className="timeline">
                        {recentActivities.map((act) => (
                            <div key={act.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,140,0,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <HardHat size={20} />
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{act.message}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{act.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Notifications</h3>
                    <div className="notifications-list">
                        {notifications.map((notif) => (
                            <div key={notif.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '1rem', borderLeft: `4px solid ${notif.type === 'error' ? 'var(--error)' : 'var(--accent)'}` }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{notif.title}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{notif.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );

    const renderProjects = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <h2>Assigned Projects</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Projects where you have assigned tasks.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {projectsList.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No assigned projects.</p> :
                 projectsList.filter(p => p.status !== 'Completed').map(project => (
                    <div key={project.id} className="dash-card project-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ color: 'var(--text-main)', margin: 0 }}>{project.title}</h3>
                            <span className={`status-pill ${project.status === 'Completed' ? 'success' : project.status === 'Planning' ? 'muted' : project.status === 'Delayed' ? 'error' : 'active'}`}>{project.status}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Project Manager</div>
                                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>Jane Cooper</div>
                            </div>
                            <div>
                                <div style={{ color: 'var(--text-muted)' }}>Deadline</div>
                                <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{project.deadline || 'N/A'}</div>
                            </div>
                        </div>

                        <Link to={`#tasks`} className="btn outline-btn" style={{ marginTop: 'auto', textAlign: 'center', textDecoration: 'none' }}>View My Tasks</Link>
                    </div>
                ))}
            </div>
        </>
    );

    const renderTasks = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <h2>My Tasks</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Update your progress on active assignments.</p>
            </div>
            
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Project ID</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Completion</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingData ? (<tr><td colSpan="6" style={{textAlign: 'center'}}>Loading tasks...</td></tr>) : 
                        tasksList.length === 0 ? (<tr><td colSpan="6" style={{textAlign: 'center', color: 'var(--text-muted)'}}>No tasks assigned.</td></tr>) :
                        tasksList.map((task) => (
                            <tr key={task.id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.title}</td>
                                <td style={{ color: 'var(--text-muted)' }}>PRJ-{task.project}</td>
                                <td>{task.deadline || 'N/A'}</td>
                                <td>
                                    <span className={`status-pill ${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'active' : 'muted'}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ flex: 1, height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${task.progress || 0}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }}></div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', width: '35px' }}>{task.progress || 0}%</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View Task</button>
                                        <button onClick={() => { setSelectedTask(task); setProgressForm({ progress: task.progress || 0, status: task.status, remarks: '' }); setShowProgressModal(true); }} className="btn accent-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Update Completion</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    return (
        <div className="dashboard-layout" style={{ display: 'block', minHeight: '100vh', paddingBottom: '3rem' }}>
            <main className="dashboard-content" style={{ marginTop: '120px', padding: '0 2rem', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
                {currentTab === '#overview' && renderOverview()}
                {currentTab === '#projects' && renderProjects()}
                {currentTab === '#tasks' && renderTasks()}
            </main>

            {/* Task Details Modal */}
            {showTaskModal && selectedTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '600px', border: '1px solid var(--border-light)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.5rem' }}>{selectedTask.title}</h3>
                        <p style={{ color: 'var(--accent)', fontWeight: 'bold', marginBottom: '1.5rem' }}>Project PRJ-{selectedTask.project}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Status</span>
                                <span className={`status-pill ${selectedTask.status === 'Completed' ? 'success' : 'active'}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{selectedTask.status}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Completion</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedTask.progress || 0}%</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Priority</span>
                                <span className="status-pill warning" style={{ marginTop: '0.5rem', display: 'inline-block' }}>High</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Due Date</span>
                                <span style={{ color: 'var(--text-main)' }}>{selectedTask.deadline || 'N/A'}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Task Description & Manager Notes</span>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                {selectedTask.description || 'Follow standard site protocols and ensure all structural milestones are reported.'}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowTaskModal(false)} className="btn outline-btn">Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Completion Modal */}
            {showProgressModal && selectedTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Update Task Completion</h3>
                        <form onSubmit={handleUpdateProgress}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Completion (%)</span>
                                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{progressForm.progress}%</span>
                                </label>
                                <input type="range" min="0" max="100" value={progressForm.progress} onChange={e => setProgressForm({...progressForm, progress: parseInt(e.target.value)})} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--accent)' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Task Status</label>
                                <select value={progressForm.status} onChange={e => setProgressForm({...progressForm, status: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Not Started">Not Started</option>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Work Remarks</label>
                                <textarea rows="3" placeholder="Add any comments for the project manager..." value={progressForm.remarks} onChange={e => setProgressForm({...progressForm, remarks: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Upload Work Image (Optional)</label>
                                <div style={{ border: '2px dashed var(--border-light)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.1)' }}>
                                    <FileUp size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem' }} />
                                    <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>Upload</span><br/>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowProgressModal(false)} className="btn outline-btn">Cancel</button>
                                <button type="submit" className="btn accent-btn">Save Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardContractor;
