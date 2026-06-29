import React from 'react';
import { Link } from 'react-router-dom';

const DashboardContractor = () => {
    return (
        <div className="dashboard-layout" style={{ paddingTop: '80px' }}>
            <aside className="sidebar">
                <ul className="sidebar-menu">
                    <li><Link to="/dashboard-contractor" className="active">Assigned Projects</Link></li>
                    <li><Link to="#">Deadlines</Link></li>
                    <li><Link to="#">Task Completion</Link></li>
                </ul>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Contractor Dashboard</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Check deadlines and update project completion.</p>
                </div>
                
                <div className="dashboard-cards">
                    <div className="dash-card">
                        <h4>Active Projects</h4>
                        <div className="value">3</div>
                    </div>
                    <div className="dash-card">
                        <h4>Upcoming Deadlines</h4>
                        <div className="value">5</div>
                    </div>
                    <div className="dash-card">
                        <h4>Completed Milestones</h4>
                        <div className="value">14</div>
                    </div>
                </div>

                <div className="recent-activity">
                    <h3>My Contract Activity</h3>
                    <ul style={{ listStyle: 'none' }}>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Marked task "Electrical Wiring Phase 1" as Completed.</li>
                        <li style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Checked deadline for "Plumbing Rough-in" (Due in 2 days).</li>
                        <li style={{ marginBottom: '1rem' }}>Viewed new assigned project scope for Riverside complex.</li>
                    </ul>
                </div>
            </main>
        </div>
    );
};

export default DashboardContractor;
