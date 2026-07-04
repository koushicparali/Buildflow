from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Notification

@receiver(post_save, sender=Task)
def task_saved_signal(sender, instance, created, **kwargs):
    # Notify assigned engineer
    if instance.assigned_engineer:
        msg = f"Task '{instance.title}' was assigned to you." if created else f"Task '{instance.title}' was updated. Status: {instance.status}, Progress: {instance.progress}%"
        Notification.objects.create(
            user=instance.assigned_engineer,
            message=msg,
            type='Info' if not created else 'Deadline',
            related_task=instance
        )
    
    # Notify assigned contractor
    if instance.assigned_contractor:
        msg = f"Task '{instance.title}' was assigned to you." if created else f"Task '{instance.title}' was updated. Status: {instance.status}, Progress: {instance.progress}%"
        Notification.objects.create(
            user=instance.assigned_contractor,
            message=msg,
            type='Info' if not created else 'Deadline',
            related_task=instance
        )
    
    # Notify Project Manager (creator of the project)
    if instance.project and instance.project.created_by:
        pm_msg = f"Task '{instance.title}' in your project '{instance.project.title}' was {'created' if created else 'updated'}."
        Notification.objects.create(
            user=instance.project.created_by,
            message=pm_msg,
            type='Info',
            related_task=instance
        )
