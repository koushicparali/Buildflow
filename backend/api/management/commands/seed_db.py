from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from api.models import Project, Task, Notification
from datetime import datetime, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with realistic construction project data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Clearing old data...")
        Notification.objects.all().delete()
        Task.objects.all().delete()
        Project.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Creating realistic users...")
        admin = User.objects.create_user(username='admin_test', email='admin@buildflow.com', password='password123', role='admin', first_name='John', last_name='Admin')
        pm1 = User.objects.create_user(username='pm_jane', email='jane@buildflow.com', password='password123', role='pm', first_name='Jane', last_name='Doe')
        pm2 = User.objects.create_user(username='pm_mark', email='mark@buildflow.com', password='password123', role='pm', first_name='Mark', last_name='Smith')
        eng1 = User.objects.create_user(username='eng_mike', email='mike@buildflow.com', password='password123', role='engineer', first_name='Mike', last_name='Engineer')
        eng2 = User.objects.create_user(username='eng_sarah', email='sarah@buildflow.com', password='password123', role='engineer', first_name='Sarah', last_name='Connor')
        client1 = User.objects.create_user(username='client_bob', email='bob@client.com', password='password123', role='client', first_name='Bob', last_name='Client')

        self.stdout.write("Creating projects...")
        now = datetime.now()
        p1 = Project.objects.create(
            title="Skyline Tower Renovations",
            description="Complete overhaul of the HVAC and electrical systems for the 40-story Skyline Tower in downtown.",
            status="In Progress",
            budget=2500000.00,
            deadline=now + timedelta(days=90),
            created_by=pm1
        )
        p2 = Project.objects.create(
            title="Metro Line Extension Phase 2",
            description="Underground tunneling and station structural foundation laying for the new metro line.",
            status="Planning",
            budget=15000000.00,
            deadline=now + timedelta(days=365),
            created_by=pm2
        )
        p3 = Project.objects.create(
            title="Green Valley Villas",
            description="Construction of 50 luxury eco-friendly villas on the outskirts of the city.",
            status="Completed",
            budget=8500000.00,
            deadline=now - timedelta(days=10),
            created_by=pm1,
            client=client1
        )

        self.stdout.write("Creating tasks...")
        # Skyline Tasks
        Task.objects.create(
            title="HVAC Duct Routing",
            description="Route the main ventilation ducts through floors 1-20.",
            status="In Progress",
            priority="High",
            progress=45,
            deadline=now + timedelta(days=14),
            project=p1,
            assigned_engineer=eng1
        )
        Task.objects.create(
            title="Electrical Panel Upgrades",
            description="Install new high-capacity breaker panels on all floors.",
            status="Pending",
            priority="Critical",
            progress=10,
            deadline=now + timedelta(days=5),
            project=p1,
            assigned_engineer=eng2
        )

        # Metro Tasks
        Task.objects.create(
            title="Geotechnical Survey",
            description="Complete soil sampling and stability analysis for the tunnel path.",
            status="Completed",
            priority="Medium",
            progress=100,
            deadline=now - timedelta(days=5),
            project=p2,
            assigned_engineer=eng1
        )
        Task.objects.create(
            title="Procure Tunnel Boring Machine",
            description="Finalize leasing agreement for the TBM and schedule delivery.",
            status="Pending",
            priority="High",
            progress=0,
            deadline=now + timedelta(days=30),
            project=p2,
            assigned_engineer=eng2
        )

        # Villas Tasks
        Task.objects.create(
            title="Final Landscape Walkthrough",
            description="Inspect all planted trees and automated irrigation systems.",
            status="Completed",
            priority="Low",
            progress=100,
            deadline=now - timedelta(days=15),
            project=p3,
            assigned_engineer=eng1
        )

        self.stdout.write("Creating notifications...")
        Notification.objects.create(user=pm1, message="HVAC Duct Routing is falling behind schedule. Please review.", type="Warning")
        Notification.objects.create(user=admin, message="Metro Line Extension budget has been approved.", type="Info")
        Notification.objects.create(user=eng2, message="You have been assigned to Electrical Panel Upgrades.", type="Info")

        self.stdout.write(self.style.SUCCESS("Successfully seeded database with realistic data!"))
