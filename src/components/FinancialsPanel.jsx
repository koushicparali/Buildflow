import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { usePolling } from '../hooks/usePolling';

const FinancialsPanel = ({ projectId }) => {
    const [report, setReport] = useState(null);
    const [project, setProject] = useState(null);

    const fetchFinancials = async () => {
        try {
            const projData = await apiFetch(`/projects/${projectId}/`);
            setProject(projData);

            const allReports = await apiFetch('/reports/');
            const projReports = allReports.filter(r => r.project === parseInt(projectId))
                                          .sort((a, b) => new Date(b.generated_date) - new Date(a.generated_date));
            if (projReports.length > 0) {
                setReport(projReports[0]); // get latest report
            }
        } catch (e) {
            console.error("Error fetching financials", e);
        }
    };

    usePolling(fetchFinancials, 15000);

    if (!project) return <div>Loading financials...</div>;

    const totalBudget = parseFloat(project.budget);
    const utilizedBudget = report ? parseFloat(report.budget_utilized) : 0;
    const remainingBudget = totalBudget - utilizedBudget;
    
    // Safety check for NaN
    const budgetPercentage = totalBudget > 0 ? (utilizedBudget / totalBudget) * 100 : 0;
    const percentageFormatted = budgetPercentage > 100 ? 100 : budgetPercentage.toFixed(1);

    const isOverBudget = remainingBudget < 0;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Financial Overview</h2>
            
            <div className="stats-grid">
                <div className="stat-card" style={{ background: 'linear-gradient(145deg, var(--bg-card), rgba(255,140,0,0.05))', borderColor: 'rgba(255,140,0,0.3)' }}>
                    <h3>Total Allocated Budget</h3>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>₹{totalBudget.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="stat-card">
                    <h3>Budget Utilized</h3>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>₹{utilizedBudget.toLocaleString('en-IN')}</p>
                </div>
                
                <div className="stat-card" style={{ borderColor: isOverBudget ? 'var(--error)' : 'var(--border-light)' }}>
                    <h3 style={{ color: isOverBudget ? 'var(--error)' : 'var(--text-muted)' }}>
                        {isOverBudget ? 'Over Budget By' : 'Remaining Budget'}
                    </h3>
                    <p className="stat-value" style={{ fontSize: '2rem', color: isOverBudget ? 'var(--error)' : 'var(--success)' }}>
                        ₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '3rem', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <h3>Budget Utilization Progress</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginTop: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{percentageFormatted}% Utilized</span>
                    <span style={{ color: isOverBudget ? 'var(--error)' : 'var(--text-muted)' }}>
                        {isOverBudget ? 'Warning: Budget Exceeded' : 'On Track'}
                    </span>
                </div>
                <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                    <div style={{ 
                        height: '100%', 
                        width: `${percentageFormatted}%`, 
                        background: isOverBudget ? 'var(--error)' : 'var(--accent-gradient)',
                        transition: 'width 1s ease-in-out'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialsPanel;
