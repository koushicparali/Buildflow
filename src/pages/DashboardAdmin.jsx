import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../utils/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';
import { FolderKanban, CheckCircle, Users, ListTodo, Plus, Filter, Edit, Trash2, MapPin, DollarSign, Calendar, Check } from 'lucide-react';

const DashboardAdmin = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [usersList, setUsersList] = useState([]);
    const [projectsList, setProjectsList] = useState([]);
    const [tasksList, setTasksList] = useState([]);
    const [queriesList, setQueriesList] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const { login } = useAuth(); // assuming login is available from useAuth

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const users = await apiFetch('/users/');
            const projects = await apiFetch('/projects/');
            const tasks = await apiFetch('/tasks/');
            const queries = await apiFetch('/queries/');
            if (users && !users.error) setUsersList(users);
            if (projects && !projects.error) setProjectsList(projects);
            if (tasks && !tasks.error) setTasksList(tasks);
            if (queries && !queries.error) setQueriesList(queries);
        } catch (e) {
            console.error("Error fetching data:", e);
        }
        setLoadingData(false);
    };

    useEffect(() => {
        if (isUnlocked) {
            fetchData();
        }
    }, [isUnlocked]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.hash]);

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoginError('');
        // Attempt login as admin1 with the provided password
        const role = await login('admin1', adminPassword);
        if (role === 'admin') {
            setIsUnlocked(true);
        } else {
            setLoginError('Incorrect password or admin account not configured.');
        }
    };

    if (!isUnlocked) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
                <div style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Admin Access</h2>
                    {loginError && <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{loginError}</div>}
                    <form onSubmit={handleUnlock}>
                        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                            <label style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
                            <input 
                                type="password" 
                                value={adminPassword} 
                                onChange={(e) => setAdminPassword(e.target.value)} 
                                placeholder="Enter admin password..."
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                required
                            />
                        </div>
                        <button type="submit" className="btn primary-btn" style={{ width: '100%' }}>Unlock Dashboard</button>
                    </form>
                </div>
            </div>
        );
    }

    // Handlers
    const handleDeleteUser = async (id) => {
        if(window.confirm('Are you sure you want to delete this user?')) {
            await apiFetch(`/users/${id}/`, { method: 'DELETE' });
            fetchData();
        }
    };

    const handleDeleteProject = async (id) => {
        if(window.confirm('Are you sure you want to delete this project?')) {
            await apiFetch(`/projects/${id}/`, { method: 'DELETE' });
            fetchData();
        }
    };

    const openUserModal = (usr = null) => {
        setEditUser(usr);
        setShowUserModal(true);
    };

    const openProjectModal = (proj = null) => {
        setEditProject(proj);
        setShowProjectModal(true);
    };

    const currentTab = location.hash || '#overview';

    // Calculate Dynamic Stats
    const totalProjects = projectsList.length;
    const totalTeamMembers = usersList.length;
    const completedTasks = tasksList.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasksList.filter(t => t.status !== 'Completed').length;

    // Calculate Project Status for PieChart
    const dynamicProjectStatusData = [
        { name: 'Completed', value: projectsList.filter(p => p.status === 'Completed').length || 0, color: '#10B981' },
        { name: 'In Progress', value: projectsList.filter(p => p.status === 'In Progress').length || 0, color: '#F59E0B' },
        { name: 'Planning', value: projectsList.filter(p => p.status === 'Planning').length || 0, color: '#3B82F6' },
        { name: 'Delayed', value: projectsList.filter(p => p.status === 'Delayed').length || 0, color: '#EF4444' },
        { name: 'On Hold', value: projectsList.filter(p => p.status === 'On Hold').length || 0, color: '#8B5CF6' },
    ].filter(d => d.value > 0); // Only show statuses that have projects

    // Ensure chart is not totally empty if no projects
    if (dynamicProjectStatusData.length === 0) {
        dynamicProjectStatusData.push({ name: 'No Projects', value: 1, color: 'var(--border-light)' });
    }

    // Calculate Monthly Progress
    const getMonthlyProgress = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = months[d.getMonth()];
            
            // Tasks created in this month
            const tasksInMonth = tasksList.filter(t => {
                if(!t.created_at) return false;
                const tDate = new Date(t.created_at);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
            });
            
            const avgProg = tasksInMonth.length > 0 
                ? Math.round(tasksInMonth.reduce((acc, t) => acc + (t.progress || 0), 0) / tasksInMonth.length)
                : 0;
            
            data.push({ name: monthName, progress: avgProg });
        }
        return data;
    };
    const dynamicMonthlyProgress = getMonthlyProgress();

    // Helper for project progress
    const getProjectProgress = (projectId) => {
        const pTasks = tasksList.filter(t => t.project === projectId);
        if(pTasks.length === 0) return 0;
        return Math.round(pTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / pTasks.length);
    };

    // Dynamic Alerts
    const dynamicNotifications = projectsList.slice(-3).reverse().map((p, idx) => ({
        id: p.id || idx,
        title: `Project Update: ${p.title}`,
        description: `Status changed to ${p.status}`
    }));
    if (dynamicNotifications.length === 0) {
        dynamicNotifications.push({ id: 0, title: "No recent activity", description: "Create a project to see updates here." });
    }

    const renderOverview = () => (
        <>
                <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                    <h2>Welcome, Administrator!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Here is a top-level view of all system activities.</p>
                </div>

                {/* Stat Cards Row */}
                <div className="dashboard-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="dash-card">
                        <div className="card-top">
                            <span className="card-title">Total Projects</span>
                        </div>
                        <div className="value-container">
                            <FolderKanban size={28} style={{ color: 'var(--accent)' }}/>
                            <div className="value" style={{ marginLeft: '10px' }}>{totalProjects}</div>
                        </div>
                    </div>
                    
                    <div className="dash-card">
                        <div className="card-top">
                            <span className="card-title">Total Team Members</span>
                        </div>
                        <div className="value-container">
                            <Users size={28} style={{ color: 'var(--accent)' }}/>
                            <div className="value" style={{ marginLeft: '10px' }}>{totalTeamMembers}</div>
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
                            <ListTodo size={28} style={{ color: 'var(--accent)' }}/>
                            <div className="value" style={{ marginLeft: '10px' }}>{pendingTasks}</div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '3rem' }}>
                    
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Project Status</h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dynamicProjectStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {dynamicProjectStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: 'var(--text-muted)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.2rem' }}>Monthly Progress</h3>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dynamicMonthlyProgress} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} domain={[0, 100]} />
                                    <RechartsTooltip cursor={{ fill: 'var(--bg-main)', opacity: 0.5 }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-light)', color: 'var(--text-main)' }} />
                                    <Bar dataKey="progress" fill="var(--accent)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Tables and lists */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                    
                    {/* Projects Table */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Projects</h3>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th>Manager</th>
                                        <th>Status</th>
                                        <th>Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectsList.length > 0 ? projectsList.slice(0, 5).map((project) => {
                                        const progress = getProjectProgress(project.id);
                                        return (
                                        <tr key={project.id}>
                                            <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{project.title}</td>
                                            <td>{usersList.find(u => u.id === project.created_by)?.username || 'Unknown'}</td>
                                            <td>
                                                <span className={`status-pill ${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'active' : 'muted'}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ fontSize: '0.9rem', width: '30px' }}>{progress}%</span>
                                                    <div style={{ width: '100px', height: '6px', backgroundColor: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--accent)' }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}) : (<tr><td colSpan="4">No projects found.</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Notifications / Deadlines */}
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Alerts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {dynamicNotifications.map(notif => (
                                <div key={notif.id} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                    <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '0.2rem' }}>{notif.title}</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{notif.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
        </>
    );

    const renderProjects = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2>Project Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Monitor and manage all construction projects.</p>
                </div>
                <button onClick={() => openProjectModal()} className="btn primary-btn" style={{ gap: '0.5rem' }}><Plus size={18}/> New Project</button>
            </div>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {loadingData ? <div style={{textAlign: 'center', width: '100%'}}>Loading...</div> : 
                projectsList.map((project) => {
                    const progress = getProjectProgress(project.id);
                    
                    return (
                        <div key={project.id} className="dash-card" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: '700' }}>{project.title}</h3>
                                <span className={`status-pill ${project.status === 'Completed' ? 'success' : project.status === 'In Progress' ? 'active' : project.status === 'Delayed' ? 'error' : 'muted'}`}>
                                    {project.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /> Location: New York HQ (Mock)</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarSign size={16} /> Budget: ₹{Number(project.budget || 0).toLocaleString('en-IN')}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={16} /> Manager: {usersList.find(u => u.id === project.created_by)?.username || 'Unknown'}</span>
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

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button className="btn outline-btn" style={{ flex: 1, padding: '0.6rem' }} onClick={() => openProjectModal(project)}><Edit size={16} /> Edit Project</button>
                                <button className="btn outline-btn" style={{ padding: '0.6rem', color: 'var(--error)' }} onClick={() => handleDeleteProject(project.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );

    const renderUsers = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2>Users & Teams</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Manage system access and team members.</p>
                </div>
                <button onClick={() => openUserModal()} className="btn primary-btn" style={{ gap: '0.5rem' }}><Plus size={18}/> Add User</button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loadingData ? (<tr><td colSpan="7" style={{textAlign: 'center'}}>Loading...</td></tr>) : 
                        usersList.map((usr) => (
                            <tr key={usr.id}>
                                <td style={{ color: 'var(--text-muted)' }}>USR-{usr.id}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                            {(usr.first_name?.[0] || usr.username[0]).toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{usr.first_name ? `${usr.first_name} ${usr.last_name}` : usr.username}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {usr.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{usr.email}</td>
                                <td style={{ color: 'var(--text-muted)' }}>-</td>
                                <td>
                                    <span className={`status-pill success`}>
                                        Active
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openUserModal(usr)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit size={18}/></button>
                                        <button onClick={() => handleDeleteUser(usr.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );

    const markQueryRead = async (queryId) => {
        await apiFetch(`/queries/${queryId}/`, { method: 'PATCH', body: JSON.stringify({ is_read: true }) });
        fetchData();
    };

    const deleteQuery = async (queryId) => {
        if (window.confirm("Are you sure you want to delete this query?")) {
            await apiFetch(`/queries/${queryId}/`, { method: 'DELETE' });
            fetchData();
        }
    };

    const renderQueries = () => (
        <>
            <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                <h2>Client Queries</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>Manage and respond to public contact form submissions.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingData ? <div style={{textAlign: 'center'}}>Loading queries...</div> : 
                 queriesList.length === 0 ? <div style={{textAlign: 'center', color: 'var(--text-muted)'}}>No queries found.</div> :
                 queriesList.map(query => (
                    <div key={query.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${query.is_read ? 'var(--border-light)' : 'var(--accent)'}`, position: 'relative' }}>
                        {!query.is_read && <span style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--accent)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>NEW</span>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{query.name}</h4>
                                <a href={`mailto:${query.email}`} style={{ color: 'var(--accent)', fontSize: '0.9rem', textDecoration: 'none' }}>{query.email}</a>
                            </div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(query.created_at).toLocaleString()}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                            {query.message}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            {!query.is_read && (
                                <button onClick={() => markQueryRead(query.id)} className="btn outline-btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Check size={16} /> Mark as Read
                                </button>
                            )}
                            <button onClick={() => deleteQuery(query.id)} className="btn outline-btn" style={{ padding: '0.5rem 1rem', color: 'var(--error)', borderColor: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div className="dashboard-layout" style={{ display: 'block', minHeight: '100vh', paddingBottom: '3rem' }}>
            <main className="dashboard-content" style={{ marginTop: '120px', padding: '0 2rem', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
                {currentTab === '#overview' && renderOverview()}
                {currentTab === '#projects' && renderProjects()}
                {currentTab === '#users' && renderUsers()}
                {currentTab === '#queries' && renderQueries()}
            </main>

            {/* User Modal */}
            {showUserModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = Object.fromEntries(formData);
                            if(!data.password) delete data.password;
                            
                            if(editUser) {
                                await apiFetch(`/users/${editUser.id}/`, { method: 'PUT', body: JSON.stringify(data) });
                            } else {
                                await apiFetch('/users/', { method: 'POST', body: JSON.stringify(data) });
                            }
                            setShowUserModal(false);
                            fetchData();
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input name="username" defaultValue={editUser?.username} placeholder="Username" required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <input name="email" defaultValue={editUser?.email} type="email" placeholder="Email" required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <input name="first_name" defaultValue={editUser?.first_name} placeholder="First Name" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <input name="last_name" defaultValue={editUser?.last_name} placeholder="Last Name" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <input name="password" type="password" placeholder={editUser ? "Leave blank to keep current password" : "Password"} required={!editUser} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <select name="role" defaultValue={editUser?.role || "engineer"} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="admin">Admin</option>
                                    <option value="pm">Project Manager</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="contractor">Contractor</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowUserModal(false)} className="btn secondary-btn">Cancel</button>
                                <button type="submit" className="btn primary-btn">{editUser ? 'Update User' : 'Save User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>{editProject ? 'Edit Project' : 'Create New Project'}</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const data = Object.fromEntries(formData);
                            data.created_by = user?.user_id || 1; // Assuming 1 is default admin
                            
                            if(editProject) {
                                await apiFetch(`/projects/${editProject.id}/`, { method: 'PUT', body: JSON.stringify(data) });
                            } else {
                                await apiFetch('/projects/', { method: 'POST', body: JSON.stringify(data) });
                            }
                            setShowProjectModal(false);
                            fetchData();
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                <input name="title" defaultValue={editProject?.title} placeholder="Project Name" required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <textarea name="description" defaultValue={editProject?.description} placeholder="Description" rows="3" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }}></textarea>
                                <input name="budget" defaultValue={editProject?.budget} type="number" step="0.01" placeholder="Budget (₹)" required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' }} />
                                <input name="deadline" defaultValue={editProject?.deadline} type="date" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', colorScheme: 'dark' }} />
                                <select name="status" defaultValue={editProject?.status || "Planning"} required style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                                    <option value="Planning">Planning</option>
                                    <option value="Active">Active</option>
                                    <option value="Delayed">Delayed</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowProjectModal(false)} className="btn secondary-btn">Cancel</button>
                                <button type="submit" className="btn primary-btn">{editProject ? 'Update Project' : 'Save Project'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardAdmin;
