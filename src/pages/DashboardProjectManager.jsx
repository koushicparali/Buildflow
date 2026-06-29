import React from 'react';
import { Link } from 'react-router-dom';

const DashboardProjectManager = () => {
    return (
        <div className="dashboard-layout" style={{ paddingTop: '80px' }}>
            <aside className="sidebar">
                <ul className="sidebar-menu">
                    <li><Link to="/dashboard-pm" className="active">Overview</Link></li>
                    <li><Link to="#">My Projects</Link></li>
                    <li><Link to="#">Task Assignment</Link></li>
                    <li><Link to="#">Progress Tracking</Link></li>
                    <li><Link to="#">Generate Reports</Link></li>
                </ul>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Project Manager Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage projects and track progress.</p>
                </div>
                
                <div className="dashboard-cards">
                    <div className="dash-card">
                        <h4>Managed Projects</h4>
                        <div className="value">8</div>
                    </div>
                    <div className="dash-card">
                        <h4>Pending Tasks</h4>
                        <div className="value">45</div>
                    </div>
                    <div className="dash-card">
                        <h4>Overall Progress</h4>
                        <div className="value">72%</div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>Recent PM Activity</h3>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Assigned "Foundation Pour" to Engineer team.</li>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Created new project: "Oakwood High School".</li>
                        <li style={{ marginBottom: '1rem' }}>Generated weekly progress report for stakeholders.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default DashboardProjectManager;
