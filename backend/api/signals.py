from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Notification, User, ContactQuery, ProjectRequest, Comment, Project, Report

@receiver(post_save, sender=Task)
def task_saved_signal(sender, instance, created, **kwargs):
    # Notify assigned engineer
    if instance.assigned_engineer:
        msg = f"Task '{instance.title}' was assigned to you." if created else f"Task '{instance.title}' was updated. Status: {instance.status}, Progress: {instance.progress}%"
        Notification.objects.create(
            recipient=instance.assigned_engineer,
            title="Task Assignment" if created else "Task Update",
            message=msg,
            category='Task',
            priority='High' if created else 'Medium',
            related_task=instance
        )
    
    # Notify Project Manager (creator of the project)
    if instance.project and instance.project.created_by:
        pm_msg = f"Task '{instance.title}' in your project '{instance.project.title}' was {'created' if created else 'updated'}."
        if instance.image:
            pm_msg += " (An image was attached)"
        Notification.objects.create(
            recipient=instance.project.created_by,
            title="Project Task Update",
            message=pm_msg,
            category='Project',
            priority='Medium',
            related_task=instance
        )
    
    # Notify Client on Completion or Image Upload
    if not created and instance.project and instance.project.client:
        if instance.status == 'Completed':
            Notification.objects.create(
                recipient=instance.project.client,
                title="Task Completed",
                message=f"Task '{instance.title}' for your project has been completed.",
                category='Project',
                priority='High',
                related_task=instance
            )
        elif instance.image:
            Notification.objects.create(
                recipient=instance.project.client,
                title="Task Image Uploaded",
                message=f"An image was uploaded for task '{instance.title}' in your project.",
                category='Project',
                priority='Medium',
                related_task=instance
            )

    # Generate AI Invoice if task is completed
    if not created and instance.status == 'Completed':
        from django.db import transaction
        try:
            import threading
            from .ai_utils import generate_task_invoice
            transaction.on_commit(lambda: threading.Thread(target=generate_task_invoice, args=(instance.id,)).start())
        except Exception as e:
            print(f"Failed to start AI invoice generation: {e}")

    # Update Project Reports Budget & Tasks
    if instance.project:
        completed_tasks = Task.objects.filter(project=instance.project, status='Completed')
        budget_used = sum([t.budget for t in completed_tasks if t.budget])
        pending_count = Task.objects.filter(project=instance.project).exclude(status='Completed').count()
        
        report, _ = Report.objects.get_or_create(
            project=instance.project
        )
        report.budget_utilized = budget_used
        report.completed_tasks = completed_tasks.count()
        report.pending_tasks = pending_count
        report.save()

@receiver(post_save, sender=ContactQuery)
def query_saved_signal(sender, instance, created, **kwargs):
    if created:
        admins = User.objects.filter(role='admin')
        for admin in admins:
            Notification.objects.create(
                user=admin,
                message=f"New Contact Query from {instance.name}: {instance.message[:50]}...",
                type='Alert'
            )

@receiver(post_save, sender=ProjectRequest)
def project_request_signal(sender, instance, created, **kwargs):
    if created:
        notify_users = User.objects.filter(role__in=['admin', 'pm'])
        for u in notify_users:
            Notification.objects.create(
                user=u,
                message=f"New Project Request: {instance.name} ({instance.project_type}) from {instance.submitted_by.username}",
                type='Alert'
            )

@receiver(post_save, sender=Comment)
def comment_saved_signal(sender, instance, created, **kwargs):
    if created:
        # Build a set of user IDs to notify
        notify_users = set()

        # Admin and PMs
        for u in User.objects.filter(role__in=['admin', 'pm']):
            notify_users.add(u)
        
        # Client
        if instance.project.client:
            notify_users.add(instance.project.client)

        # Engineers assigned to tasks in the project
        project_tasks = Task.objects.filter(project=instance.project)
        for t in project_tasks:
            if t.assigned_engineer:
                notify_users.add(t.assigned_engineer)

        for u in notify_users:
            if u.id != instance.author.id:
                Notification.objects.create(
                    user=u,
                    message=f"New discussion comment by {instance.author.username} on project '{instance.project.title}'",
                    type='Info',
                    related_project=instance.project
                )

@receiver(post_save, sender=Project)
def project_saved_signal(sender, instance, created, **kwargs):
    if created:
        pms = User.objects.filter(role='pm')
        for pm in pms:
            Notification.objects.create(
                user=pm,
                message=f"New project '{instance.title}' has been created.",
                type='Info',
                related_project=instance
            )
    else:
        if instance.client:
            Notification.objects.create(
                user=instance.client,
                message=f"Your project '{instance.title}' has an update. Current status: {instance.status}",
                type='Info',
                related_project=instance
            )
