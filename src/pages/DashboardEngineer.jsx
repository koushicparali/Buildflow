import React from 'react';
import { Link } from 'react-router-dom';

const DashboardEngineer = () => {
    return (
        <div className="dashboard-layout" style={{ paddingTop: '80px' }}>
            <aside className="sidebar">
                <ul className="sidebar-menu">
                    <li><Link to="/dashboard-engineer" className="active">My Tasks</Link></li>
                    <li><Link to="#">Work Progress</Link></li>
                    <li><Link to="#">Submit Status Updates</Link></li>
                </ul>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Engineer Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>View tasks and update progress.</p>
                </div>
                
                <div className="dashboard-cards">
                    <div className="dash-card">
                        <h4>Assigned Tasks</h4>
                        <div className="value">12</div>
                    </div>
                    <div className="dash-card">
                        <h4>Tasks Completed</h4>
                        <div className="value">8</div>
                    </div>
                    <div className="dash-card">
                        <h4>Pending Updates</h4>
                        <div className="value">2</div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>My Task Activity</h3>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Updated progress on "Structural Framing" (80% Complete).</li>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Submitted daily status update for Site B.</li>
                        <li style={{ marginBottom: '1rem' }}>Viewed new assigned task: "HVAC Inspection".</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default DashboardEngineer;
