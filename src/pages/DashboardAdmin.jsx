import React from 'react';
import { Link } from 'react-router-dom';

const DashboardAdmin = () => {
    return (
        <div className="dashboard-layout" style={{ paddingTop: '80px' }}>
            <aside className="sidebar">
                <ul className="sidebar-menu">
                    <li><Link to="/dashboard-admin" className="active">Overview</Link></li>
                    <li><Link to="#">User Management</Link></li>
                    <li><Link to="#">All Projects</Link></li>
                    <li><Link to="#">System Reports</Link></li>
                    <li><Link to="#">Settings</Link></li>
                </ul>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Admin Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Full System Access</p>
                </div>
                
                <div className="dashboard-cards">
                    <div className="dash-card">
                        <h4>Total Users</h4>
                        <div className="value">342</div>
                    </div>
                    <div className="dash-card">
                        <h4>Active Projects</h4>
                        <div className="value">24</div>
                    </div>
                    <div className="dash-card">
                        <h4>System Health</h4>
                        <div className="value">100%</div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent Administrative Activity</h3>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>New User "John Doe" (Engineer) created.</li>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Project "Downtown Skyscraper" monitored for compliance.</li>
                        <li style={{ marginBottom: '1rem' }}>Monthly system performance report viewed.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default DashboardAdmin;
