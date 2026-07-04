from django.core.management.base import BaseCommand
from api.models import Task, Notification, User
from django.utils import timezone
import datetime

class Command(BaseCommand):
    help = 'Escalates missed deadlines up the hierarchy'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        tasks = Task.objects.exclude(status='Completed').exclude(deadline__isnull=True)
        
        for task in tasks:
            days_late = (today - task.deadline).days
            
            if days_late == 0:
                # Due today - Notify Contractor
                if task.assigned_contractor:
                    Notification.objects.get_or_create(
                        user=task.assigned_contractor,
                        related_task=task,
                        type='Deadline',
                        escalation_level=0,
                        defaults={'message': f'Reminder: Task "{task.title}" is due today.'}
                    )
            elif days_late == 1:
                # 1 day late - Escalate to Engineer
                if task.assigned_engineer:
                    Notification.objects.get_or_create(
                        user=task.assigned_engineer,
                        related_task=task,
                        type='Escalation',
                        escalation_level=1,
                        defaults={'message': f'Escalation: Task "{task.title}" is 1 day overdue.'}
                    )
            elif days_late == 3:
                # 3 days late - Escalate to PM
                # Assuming the Project creator or a PM role user
                pm = task.project.created_by
                if pm:
                    Notification.objects.get_or_create(
                        user=pm,
                        related_task=task,
                        type='Escalation',
                        escalation_level=2,
                        defaults={'message': f'Escalation: Task "{task.title}" is 3 days overdue.'}
                    )
            elif days_late >= 7 and days_late % 7 == 0:
                # 7 days late (and every week) - Escalate to Admin
                admins = User.objects.filter(role='admin')
                for admin in admins:
                    Notification.objects.get_or_create(
                        user=admin,
                        related_task=task,
                        type='Escalation',
                        escalation_level=3,
                        defaults={'message': f'CRITICAL Escalation: Task "{task.title}" is {days_late} days overdue.'}
                    )
                    
        self.stdout.write(self.style.SUCCESS('Successfully ran escalation checks.'))
