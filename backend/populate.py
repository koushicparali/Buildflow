import os
import django
import sys
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import User, Project, Task, Report, Milestone, Inspection, ChangeRequest, Comment
from django.contrib.auth.hashers import make_password

def populate():
    print("Creating Client User...")
    client_user, created = User.objects.get_or_create(
        username="client_demo",
        defaults={
            "first_name": "Demo",
            "last_name": "Client",
            "email": "client@buildflow.com",
            "role": "client",
            "password": make_password("password123")
        }
    )
    if not created:
        client_user.set_password("password123")
        client_user.save()

    print("Creating PM User...")
    pm_user, _ = User.objects.get_or_create(
        username="pm_demo",
        defaults={
            "first_name": "Project",
            "last_name": "Manager",
            "email": "pm@buildflow.com",
            "role": "pm",
            "password": make_password("password123")
        }
    )

    print("Creating Engineer User...")
    engineer_user, _ = User.objects.get_or_create(
        username="eng_demo",
        defaults={
            "first_name": "Site",
            "last_name": "Engineer",
            "email": "eng@buildflow.com",
            "role": "engineer",
            "password": make_password("password123")
        }
    )

    print("Creating Project...")
    project, _ = Project.objects.get_or_create(
        title="Skyline Tower Plaza Phase 2",
        defaults={
            "description": "Construction of a 30-story commercial plaza.",
            "location": "Downtown Metro Area",
            "created_by": pm_user,
            "client": client_user,
            "status": "In Progress",
            "budget": 12500000.00,
            "deadline": date.today() + timedelta(days=180)
        }
    )
    # Ensure client is assigned if already created
    project.client = client_user
    project.budget = 12500000.00
    project.status = "In Progress"
    project.save()

    print("Creating Milestones...")
    Milestone.objects.get_or_create(
        project=project,
        title="Foundation & Groundwork",
        defaults={
            "completion_percentage": 100,
            "due_date": date.today() - timedelta(days=60),
            "status": "Completed"
        }
    )
    Milestone.objects.get_or_create(
        project=project,
        title="Structural Framing (Floors 1-15)",
        defaults={
            "completion_percentage": 65,
            "due_date": date.today() + timedelta(days=30),
            "status": "In Progress"
        }
    )
    Milestone.objects.get_or_create(
        project=project,
        title="Electrical & Plumbing Core",
        defaults={
            "completion_percentage": 0,
            "due_date": date.today() + timedelta(days=90),
            "status": "Pending"
        }
    )

    print("Creating Inspections...")
    Inspection.objects.get_or_create(
        project=project,
        type="Concrete Pour Quality Check",
        date=date.today() - timedelta(days=15),
        defaults={
            "inspector": engineer_user,
            "status": "Passed",
            "findings": "Concrete strength exceeds the required 4000 PSI metric. Rebar spacing is perfectly aligned with blueprints."
        }
    )
    Inspection.objects.get_or_create(
        project=project,
        type="Safety Protocol Audit",
        date=date.today() - timedelta(days=2),
        defaults={
            "inspector": pm_user,
            "status": "Pending Corrective Action",
            "findings": "Scaffolding on the East wing lacks proper fall protection netting on the 4th level.",
            "corrective_actions": "Halt East wing exterior work. Install high-tensile safety netting by tomorrow EOD."
        }
    )

    print("Creating Financial Report...")
    Report.objects.get_or_create(
        project=project,
        health="Good",
        defaults={
            "completion_percentage": 35,
            "budget_utilized": 4125000.00,
            "pending_tasks": 12,
            "completed_tasks": 45
        }
    )
    
    # Update latest report just in case
    report = Report.objects.filter(project=project).last()
    if report:
        report.budget_utilized = 4125000.00
        report.save()

    print("Creating Change Request...")
    ChangeRequest.objects.get_or_create(
        project=project,
        title="Upgrade lobby flooring to imported marble",
        defaults={
            "submitted_by": client_user,
            "description": "We would like to upgrade the standard tile flooring in the main lobby to imported Italian marble.",
            "priority": "Medium",
            "status": "Under Review",
            "estimated_impact": "Adds $45,000 to budget, +5 days to schedule."
        }
    )

    print("Creating Comments...")
    comment1, _ = Comment.objects.get_or_create(
        project=project,
        author=pm_user,
        text="The foundation passed all stress tests yesterday. We are officially moving forward with framing!"
    )
    Comment.objects.get_or_create(
        project=project,
        author=client_user,
        text="Excellent news. Will the slight delay in material delivery affect next week's schedule?",
        parent_comment=comment1
    )

    print("Database population complete!")
    print("\nTest Accounts:")
    print("Client -> Username: client_demo | Password: password123")
    print("PM -> Username: pm_demo | Password: password123")
    print("Engineer -> Username: eng_demo | Password: password123")

if __name__ == '__main__':
    populate()
