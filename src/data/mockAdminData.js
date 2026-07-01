export const projectStatusData = [
    { name: 'Completed', value: 35, color: '#10B981' }, // emerald-500
    { name: 'Active', value: 45, color: '#F59E0B' },    // amber-500
    { name: 'Planning', value: 15, color: '#3B82F6' },  // blue-500
    { name: 'Delayed', value: 5, color: '#EF4444' },    // red-500
];

export const monthlyProgressData = [
    { name: 'Jan', progress: 45 },
    { name: 'Feb', progress: 52 },
    { name: 'Mar', progress: 68 },
    { name: 'Apr', progress: 74 },
    { name: 'May', progress: 85 },
    { name: 'Jun', progress: 92 },
];

export const taskCompletionData = [
    { name: 'Week 1', completed: 120, pending: 45 },
    { name: 'Week 2', completed: 140, pending: 50 },
    { name: 'Week 3', completed: 175, pending: 35 },
    { name: 'Week 4', completed: 210, pending: 20 },
];

export const recentProjects = [
    {
        id: 'PRJ-1042',
        name: 'Skyline Apartments',
        location: 'Downtown District',
        manager: 'Jane Cooper',
        budget: '$4.5M',
        status: 'Active',
        progress: 80,
        deadline: '2026-11-15'
    },
    {
        id: 'PRJ-1043',
        name: 'Green Valley Villas',
        location: 'Westside Suburbs',
        manager: 'Robert Fox',
        budget: '$12.2M',
        status: 'Delayed',
        progress: 55,
        deadline: '2026-09-30'
    },
    {
        id: 'PRJ-1044',
        name: 'Tech Park Phase 2',
        location: 'Innovation Hub',
        manager: 'Esther Howard',
        budget: '$8.9M',
        status: 'Completed',
        progress: 100,
        deadline: '2026-06-10'
    },
    {
        id: 'PRJ-1045',
        name: 'City Mall Renovation',
        location: 'Central Plaza',
        manager: 'Cameron Williamson',
        budget: '$2.1M',
        status: 'Planning',
        progress: 15,
        deadline: '2027-02-28'
    }
];

export const recentActivities = [
    {
        id: 1,
        type: 'project_created',
        message: 'New Project "Riverside Complex" Created',
        time: '2 hours ago',
        user: 'Admin'
    },
    {
        id: 2,
        type: 'task_assigned',
        message: 'Task "Foundation Inspection" Assigned to John Doe',
        time: '5 hours ago',
        user: 'Jane PM'
    },
    {
        id: 3,
        type: 'progress_updated',
        message: 'Engineer updated progress on Skyline Apartments to 80%',
        time: 'Yesterday at 4:30 PM',
        user: 'John Doe'
    },
    {
        id: 4,
        type: 'report_generated',
        message: 'Monthly Safety Report Generated',
        time: 'Yesterday at 9:00 AM',
        user: 'System'
    },
    {
        id: 5,
        type: 'budget_updated',
        message: 'Budget for Green Valley Villas increased by $500k',
        time: '2 days ago',
        user: 'Admin'
    }
];

export const upcomingDeadlines = [
    {
        id: 1,
        taskName: 'Structural Audit',
        assignedTo: 'John Doe',
        remainingDays: 2,
        priority: 'High'
    },
    {
        id: 2,
        taskName: 'Electrical Wiring Phase 1',
        assignedTo: 'Mike Smith',
        remainingDays: 5,
        priority: 'Medium'
    },
    {
        id: 3,
        taskName: 'Plumbing Initial Setup',
        assignedTo: 'Sarah Connor',
        remainingDays: 1,
        priority: 'Critical'
    }
];

export const teamOverview = [
    { role: 'Project Managers', count: 12, icon: 'Briefcase', description: 'Overseeing active sites' },
    { role: 'Engineers', count: 45, icon: 'HardHat', description: 'On-site technical leads' },
    { role: 'Contractors', count: 128, icon: 'Hammer', description: 'Active field workers' },
    { role: 'Architects', count: 8, icon: 'PenTool', description: 'Design & Planning' }
];

export const notifications = [
    { id: 1, title: 'Project Deadline Tomorrow', description: 'Green Valley Villas phase 1 is due.', type: 'warning' },
    { id: 2, title: '3 Pending Tasks', description: 'Requires immediate admin review.', type: 'info' },
    { id: 3, title: 'Budget Limit Reached', description: 'Tech Park phase 2 hit 95% of allocated budget.', type: 'error' },
    { id: 4, title: 'Engineer Submitted Report', description: 'Monthly structural analysis ready for download.', type: 'success' }
];

export const mockUsersList = [
    { id: 'USR-001', name: 'Admin User', role: 'admin', email: 'admin@buildflow.com', phone: '+1 555-0101', status: 'Active' },
    { id: 'USR-002', name: 'Jane Cooper', role: 'project_manager', email: 'jane@buildflow.com', phone: '+1 555-0102', status: 'Active' },
    { id: 'USR-003', name: 'Robert Fox', role: 'project_manager', email: 'robert@buildflow.com', phone: '+1 555-0103', status: 'Active' },
    { id: 'USR-004', name: 'Esther Howard', role: 'engineer', email: 'esther@buildflow.com', phone: '+1 555-0104', status: 'Inactive' },
    { id: 'USR-005', name: 'Cameron Williamson', role: 'contractor', email: 'cameron@buildflow.com', phone: '+1 555-0105', status: 'Active' },
    { id: 'USR-006', name: 'Leslie Alexander', role: 'engineer', email: 'leslie@buildflow.com', phone: '+1 555-0106', status: 'Active' },
    { id: 'USR-007', name: 'Kristin Watson', role: 'contractor', email: 'kristin@buildflow.com', phone: '+1 555-0107', status: 'Active' }
];
