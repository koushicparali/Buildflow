import React, { useEffect, useRef, useState } from 'react';

const StatItem = ({ target, label, delay }) => {
    const [count, setCount] = useState(0);
    const itemRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                let start = 0;
                const end = parseInt(target, 10);
                const duration = 2000;
                const increment = end / (duration / 16);
                
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
        <div className="stat-box reveal fade-up" style={{ transitionDelay: delay }} ref={itemRef}>
            <div className="stat-number">{count}</div>
            <p>{label}</p>
        </div>
    );
};

const StatsBox = () => {
    return (
        <section id="stats" className="stats-section reveal fade-up">
            <StatItem target="1500" label="Tasks Completed" delay="0s" />
            <StatItem target="300" label="Active Staff" delay="0.2s" />
            <StatItem target="50" label="Hours Saved" delay="0.4s" />
        </section>
    );
};

export default StatsBox;
