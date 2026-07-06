import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ListTodo, Activity, FileUp, Clock } from 'lucide-react';

const DashboardEngineer = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const [tasksList, setTasksList] = useState([]);
    const [upcomingDeadlinesList, setUpcomingDeadlinesList] = useState([]);

    const [loadingData, setLoadingData] = useState(true);
    
    // Modals
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    
    // Forms
    const [progressForm, setProgressForm] = useState({ progress: 0, remarks: '', image: null });
    const [statusForm, setStatusForm] = useState({ status: 'Pending', comments: '' });

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const allTasks = await apiFetch('/tasks/');
            const deadlinesRes = await apiFetch('/upcoming-deadlines/');
            
            // Filter locally for safety.
            if (allTasks && !allTasks.error) {
                const myTasks = allTasks.filter(t => t.assigned_engineer === user?.user_id);
                setTasksList(myTasks);
            }
            if (deadlinesRes && !deadlinesRes.error) {
                setUpcomingDeadlinesList(deadlinesRes.tasks || []);
            }

        } catch (e) {
            console.error("Error fetching engineer data:", e);
        }
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
        window.scrollTo(0, 0);
    }, [location.hash]);

    const currentTab = ['#overview', '#tasks'].includes(location.hash) ? location.hash : '#overview';

    // Stats
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasksList.filter(t => t.status === 'Pending').length;
    const incompleteTasks = tasksList.filter(t => t.status !== 'Completed').length;
    const avgProgress = totalTasks > 0 ? Math.round(tasksList.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks) : 0;
    
    // Handlers
    const handleUpdateProgress = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('progress', progressForm.progress);
            if (progressForm.remarks) {
                formData.append('remarks', progressForm.remarks);
            }
            if (progressForm.image) {
                formData.append('image', progressForm.image);
            }

            await apiFetch(`/tasks/${selectedTask.id}/`, {
                method: 'PATCH',
                body: formData
            });
            setShowProgressModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to update progress: " + err.message);
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            await apiFetch(`/tasks/${selectedTask.id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status: statusForm.status })
            });
            setShowStatusModal(false);
            fetchData();
        } catch (err) {
            alert("Failed to update status: " + err.message);
        }
    };

    const renderOverview = () => (
        <>
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Activity size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>System Overview</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Welcome back, {user?.username}. Here is your active workspace.</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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
                        <span className="card-title">Incomplete Tasks</span>
                    </div>
                    <div className="value-container">
                        <Activity size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{incompleteTasks}</div>
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
                        <span className="card-title">Pending Tasks</span>
                    </div>
                    <div className="value-container">
                        <Clock size={28} style={{ color: 'var(--accent)' }}/>
                        <div className="value" style={{ marginLeft: '10px' }}>{pendingTasks}</div>
                    </div>
                </div>
                <div className="dash-card">
                    <div className="card-top">
                        <span className="card-title">Avg Progress</span>
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
                        <Link to="#tasks" className="btn outline-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none' }}>View Assigned Tasks</Link>
                        <Link to="#tasks" className="btn accent-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none' }}>Update Progress</Link>
                        <Link to="#tasks" className="btn outline-btn" style={{ textAlign: 'center', padding: '1rem', textDecoration: 'none', gridColumn: 'span 2' }}>Submit Status</Link>
                    </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Upcoming Deadlines</h3>
                    <div className="deadline-list">
                        {upcomingDeadlinesList.length === 0 ? (
                            <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>No upcoming deadlines.</div>
                        ) : upcomingDeadlinesList.map((dl) => {
                            const today = new Date();
                            const dlDate = new Date(dl.deadline);
                            const diffTime = dlDate - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const remainingText = diffDays > 0 ? `Due in ${diffDays} days` : diffDays === 0 ? 'Due today' : `Overdue by ${Math.abs(diffDays)} days`;

                            return (
                            <div key={dl.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{dl.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{remainingText}</div>
                                </div>
                                <span className={`status-pill ${dl.priority === 'Critical' ? 'error' : dl.priority === 'High' ? 'warning' : 'active'}`}>{dl.priority}</span>
                            </div>
                        )})}
                    </div>
                </div>
            </div>


        </>
    );

    const renderTasks = () => (
        <>
            <div className="dashboard-header dash-card" style={{ marginBottom: '2.5rem', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255, 140, 0, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ListTodo size={36} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h2 style={{ marginBottom: '0.2rem', color: 'var(--text-main)', fontSize: '1.8rem' }}>My Assigned Tasks</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>Manage and update your daily workflow.</p>
                    </div>
                </div>
            </div>
            
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Task Name</th>
                            <th>Project ID</th>
                            <th>Priority</th>
                            <th>Budget</th>
                            <th>Status</th>
                            <th>Progress</th>
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
                                <td><span className="status-pill warning">Medium</span></td>
                                <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{parseFloat(task.budget || 0).toLocaleString('en-IN')}</td>
                                <td>
                                    <span className={`status-pill ${task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'active' : 'muted'}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{task.progress || 0}%</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setSelectedTask(task); setShowTaskModal(true); }} className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View</button>
                                        <button onClick={() => { setSelectedTask(task); setProgressForm({ progress: task.progress || 0, remarks: '' }); setShowProgressModal(true); }} className="btn accent-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Update</button>
                                        <button onClick={() => { setSelectedTask(task); setStatusForm({ status: task.status, comments: '' }); setShowStatusModal(true); }} className="btn outline-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Status</button>
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
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Progress</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedTask.progress || 0}%</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Assigned By</span>
                                <span style={{ color: 'var(--text-main)' }}>System / PM</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>Deadline</span>
                                <span style={{ color: 'var(--text-main)' }}>{selectedTask.deadline || 'N/A'}</span>
                            </div>
                            <div style={{ gridColumn: '1 / -1', background: 'rgba(255, 140, 0, 0.1)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent)', fontSize: '1rem', fontWeight: 'bold' }}>Allocated Budget</span>
                                <span style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: '800' }}>₹{parseFloat(selectedTask.budget || 0).toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Description</span>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                                {selectedTask.description || 'No detailed description provided for this task.'}
                            </div>
                        </div>

                        {selectedTask.image && (
                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Attached Image</span>
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <img src={`http://localhost:8000${selectedTask.image}`} alt="Task Attachment" loading="lazy" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} />
                                </div>
                            </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowTaskModal(false)} className="btn outline-btn">Close Details</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Progress Modal */}
            {showProgressModal && selectedTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Update Work Progress</h3>
                        <form onSubmit={handleUpdateProgress}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Progress (%)</span>
                                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{progressForm.progress}%</span>
                                </label>
                                <input type="range" min="0" max="100" value={progressForm.progress} onChange={e => setProgressForm({...progressForm, progress: parseInt(e.target.value)})} disabled={selectedTask.status !== 'In Progress'} style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--accent)', cursor: selectedTask.status !== 'In Progress' ? 'not-allowed' : 'pointer' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Work Description / Remarks</label>
                                <textarea rows="4" placeholder="Briefly describe the work completed..." value={progressForm.remarks} onChange={e => setProgressForm({...progressForm, remarks: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}></textarea>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Upload Work Image (Optional)</label>
                                <label style={{ display: 'block', border: '2px dashed var(--border-light)', borderRadius: '8px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.1)' }}>
                                    <input type="file" accept="image/png, image/jpeg" style={{ display: 'none' }} onChange={(e) => setProgressForm({...progressForm, image: e.target.files[0]})} />
                                    {progressForm.image ? (
                                        <span style={{ color: 'var(--success)' }}>{progressForm.image.name} selected</span>
                                    ) : (
                                        <>
                                            <FileUp size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                                            <span style={{ color: 'var(--accent)' }}>Click to upload</span> or drag and drop<br/>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG up to 10MB</span>
                                        </>
                                    )}
                                </label>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowProgressModal(false)} className="btn outline-btn">Cancel</button>
                                <button type="submit" className="btn accent-btn">Save Progress</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submit Status Modal */}
            {showStatusModal && selectedTask && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '500px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Submit Status Update</h3>
                        <form onSubmit={handleUpdateStatus}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Task Status</label>
                                <select value={statusForm.status} onChange={e => setStatusForm({...statusForm, status: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '2rem' }}>
                                <label>Comments</label>
                                <textarea rows="4" placeholder="Any blockers or comments for the PM?" value={statusForm.comments} onChange={e => setStatusForm({...statusForm, comments: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowStatusModal(false)} className="btn outline-btn">Cancel</button>
                                <button type="submit" className="btn accent-btn">Submit Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardEngineer;
