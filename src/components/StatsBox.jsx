import React, { useEffect, useRef, useState } from 'react';

const StatItem = ({ target, label, delay, suffix = "", trend = "" }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const itemRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const end = parseInt(target, 10);
                const duration = 2000;
                const increment = end / (duration / 16);
                
                setIsVisible(true);

                const timer = setInterval(() => {
                    start += increment;
                    if (start >= end) {
                        setCount(end);
                        clearInterval(timer);
                    } else {
                        setCount(Math.ceil(start));
                    }
                }, 16);
                observer.disconnect();
            }
        });

        if (itemRef.current) {
            observer.observe(itemRef.current);
        }

        return () => observer.disconnect();
    }, [target]);

    return (
        <div className={`stat-box fade-up ${isVisible ? 'active' : ''}`} style={{ opacity: isVisible ? 1 : 0, transform: isVisible ? 'translateY(0)' : 'translateY(30px)', transition: `all 0.8s ease-out ${delay}`, background: 'var(--card-bg)', border: '1px solid var(--border-light)', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} ref={itemRef}>
            <div className="stat-number" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1 }}>{count}{suffix}</div>
            <p style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>{label}</p>
            {trend && <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>{trend}</span>}
        </div>
    );
};

const StatsBox = () => {
    const [stats, setStats] = useState({
        tasksCompleted: 1500,
        activeStaff: 300,
        activeProjects: 50
    });

    useEffect(() => {
        fetch('http://localhost:8000/api/public-stats/')
            .then(res => res.json())
            .then(data => {
                setStats({
                    tasksCompleted: data.tasks_completed || 0,
                    activeStaff: data.active_staff || 0,
                    activeProjects: data.active_projects || 0
                });
            })
            .catch(err => console.error("Failed to fetch live stats:", err));
    }, []);

    return (
        <section id="stats" className="stats-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '6rem 5%', maxWidth: '1200px', margin: '0 auto', border: 'none', background: 'transparent' }}>
            <StatItem target={stats.tasksCompleted.toString()} label="Tasks Completed" delay="0s" suffix="+" trend="▲ Real-time metric" />
            <StatItem target={stats.activeStaff.toString()} label="Active Staff" delay="0.2s" suffix="" trend="✓ Verified users" />
            <StatItem target={stats.activeProjects.toString()} label="Active Projects" delay="0.4s" suffix="" trend="▲ Live tracking" />
        </section>
    );
};

export default StatsBox;
