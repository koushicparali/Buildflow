import os
import django
import random
from datetime import timedelta
from django.utils import timezone
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, Project, Task, Report

def seed_data():
    print("Clearing old data...")
    User.objects.all().delete()
    Project.objects.all().delete()
    Task.objects.all().delete()
    Report.objects.all().delete()

    print("Creating specific users...")
    users_data = [
        {'username': 'admin', 'role': 'admin', 'password': 'password123', 'email': 'admin@buildflow.com', 'first_name': 'Super', 'last_name': 'Admin'},
        {'username': 'test@pm', 'role': 'pm', 'password': 'password123', 'email': 'pm@buildflow.com', 'first_name': 'Sarah', 'last_name': 'Manager'},
        {'username': 'test@engineer', 'role': 'engineer', 'password': 'password123', 'email': 'engineer@buildflow.com', 'first_name': 'John', 'last_name': 'Engineer'},
        {'username': 'test@contractor', 'role': 'contractor', 'password': 'password123', 'email': 'contractor@buildflow.com', 'first_name': 'Bob', 'last_name': 'Builder'},
    ]

    user_objs = {}
    for data in users_data:
        u = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role']
        )
        user_objs[data['role']] = u

    print("Generating 10 realistic construction projects...")
    projects_info = [
        {"title": "Skyline Residency", "location": "Mumbai, MH", "budget": "150000000.00", "desc": "A 45-story premium residential complex overlooking the Arabian Sea."},
        {"title": "Green Valley Villas", "location": "Pune, MH", "budget": "85000000.00", "desc": "An eco-friendly gated community featuring 120 luxury villas."},
        {"title": "Tech Park Tower", "location": "Bengaluru, KA", "budget": "250000000.00", "desc": "State-of-the-art IT park with LEED Platinum certification."},
        {"title": "Metro Commercial Complex", "location": "Delhi, DL", "budget": "320000000.00", "desc": "Mixed-use commercial space integrated with the upcoming metro station."},
        {"title": "Sunrise Apartments", "location": "Chennai, TN", "budget": "65000000.00", "desc": "Affordable housing initiative comprising 500 units."},
        {"title": "Riverfront Residency", "location": "Ahmedabad, GJ", "budget": "110000000.00", "desc": "Premium residential towers situated along the Sabarmati riverfront."},
        {"title": "Smart City Office Hub", "location": "Hyderabad, TS", "budget": "190000000.00", "desc": "Next-generation corporate park featuring IoT enabled infrastructure."},
        {"title": "Blue Horizon Mall", "location": "Kochi, KL", "budget": "210000000.00", "desc": "Regional shopping center with 200+ retail spaces and a multiplex."},
        {"title": "City Central Hospital", "location": "Kolkata, WB", "budget": "450000000.00", "desc": "A 500-bed multi-specialty hospital with advanced surgical wings."},
        {"title": "Grand Heights", "location": "Noida, UP", "budget": "135000000.00", "desc": "High-rise luxury condominiums with exclusive clubhouse amenities."}
    ]

    statuses = ['Planning', 'In Progress', 'Completed', 'Delayed', 'On Hold']
    task_templates = [
        "Site Survey and Soil Testing",
        "Excavation and Earthwork",
        "Foundation Pouring",
        "Steel Reinforcement (Basement)",
        "Concrete Pillar Erection",
        "Floor Slab Casting",
        "Brick Masonry (Ground Floor)",
        "Electrical Conduit Installation",
        "Plumbing Rough-in",
        "HVAC Ducting",
        "Plastering and Finishing",
        "Window and Door Installation",
        "Interior Painting",
        "Exterior Facade Completion",
        "Final Quality Inspection"
    ]

    now = timezone.now()

    for idx, p_info in enumerate(projects_info):
        # Pick a status favoring In Progress
        p_status = random.choices(statuses, weights=[10, 50, 20, 10, 10])[0]
        
        # Distribute projects across the last 0 to 5 months to guarantee chart visibility
        months_ago = idx % 6 # This ensures at least one project started in each of the past 6 months
        created_date = now - timedelta(days=30*months_ago)
        
        if p_status == 'Completed':
            deadline_date = now - timedelta(days=random.randint(1, 60))
        elif p_status == 'Planning':
            deadline_date = now + timedelta(days=random.randint(180, 365))
        else:
            deadline_date = now + timedelta(days=random.randint(30, 200))

        project = Project.objects.create(
            title=p_info['title'],
            description=p_info['desc'],
            location=p_info['location'],
            budget=Decimal(p_info['budget']),
            status=p_status,
            created_by=user_objs['pm'],
            deadline=deadline_date.date()
        )
        project.created_at = created_date
        project.save()
        
        # Assign Contractor
        project.assigned_contractors.add(user_objs['contractor'])

        # Generate Tasks
        num_tasks = random.randint(8, 15)
        project_tasks = []
        
        for i in range(num_tasks):
            t_title = task_templates[i]
            
            # Determine task status based on project status and task order
            if p_status == 'Completed':
                t_status = 'Completed'
                t_prog = 100
            elif p_status == 'Planning':
                t_status = 'Pending'
                t_prog = 0
            else:
                # In Progress/Delayed - early tasks are done, middle are active, late are pending
                if i < num_tasks // 3:
                    t_status = 'Completed'
                    t_prog = 100
                elif i == num_tasks // 3:
                    t_status = 'In Progress' if p_status != 'Delayed' else 'Delayed'
                    t_prog = random.randint(10, 80)
                else:
                    t_status = 'Pending'
                    t_prog = 0
                    
            t_start = created_date + timedelta(days=i*15)
            t_deadline = t_start + timedelta(days=20)
            
            t_priority = random.choice(['Low', 'Medium', 'High', 'Critical'])
            
            task = Task.objects.create(
                title=t_title,
                description=f"Standard execution protocol for {t_title.lower()} at {project.title}.",
                project=project,
                assigned_engineer=user_objs['engineer'],
                assigned_contractor=user_objs['contractor'],
                priority=t_priority,
                status=t_status,
                progress=t_prog,
                start_date=t_start.date(),
                deadline=t_deadline.date(),
                remarks="No major blockers." if t_status != 'Delayed' else "Pending material delivery."
            )
            Task.objects.filter(id=task.id).update(created_at=t_start)
            project_tasks.append(task)

        # Generate Report
        completed_count = sum(1 for t in project_tasks if t.status == 'Completed')
        pending_count = len(project_tasks) - completed_count
        overall_progress = int((completed_count / len(project_tasks)) * 100) if project_tasks else 0
        
        # Calculate budget utilized (roughly tied to progress + some variance)
        budget_utilized = (Decimal(p_info['budget']) * Decimal(overall_progress) / Decimal(100)) * Decimal(random.uniform(0.9, 1.1))
        
        if p_status == 'Delayed':
            health = 'Critical'
        elif overall_progress < 20 and p_status == 'In Progress' and (deadline_date.date() - now.date()).days < 30:
            health = 'Warning'
        else:
            health = 'Good'

        Report.objects.create(
            project=project,
            completion_percentage=overall_progress,
            budget_utilized=budget_utilized,
            pending_tasks=pending_count,
            completed_tasks=completed_count,
            health=health
        )

    print("Realistic database seeding completed successfully!")

if __name__ == '__main__':
    seed_data()
