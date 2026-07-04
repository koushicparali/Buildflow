from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('pm', 'Project Manager'),
        ('engineer', 'Engineer'),
        ('contractor', 'Contractor'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='engineer')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    assigned_contractors = models.ManyToManyField(User, related_name='assigned_projects', blank=True)
    
    STATUS_CHOICES = (
        ('Planning', 'Planning'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Delayed', 'Delayed'),
        ('On Hold', 'On Hold'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Planning')
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    deadline = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    
    assigned_engineer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_engineer_tasks')
    assigned_contractor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_contractor_tasks')
    
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium')
    
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Delayed', 'Delayed'),
    )
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    
    progress = models.IntegerField(default=0) # 0 to 100 percentage
    start_date = models.DateField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.project.title}"

class Report(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports')
    completion_percentage = models.IntegerField(default=0)
    budget_utilized = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pending_tasks = models.IntegerField(default=0)
    completed_tasks = models.IntegerField(default=0)
    
    HEALTH_CHOICES = (
        ('Good', 'Good'),
        ('Warning', 'Warning'),
        ('Critical', 'Critical'),
    )
    health = models.CharField(max_length=20, choices=HEALTH_CHOICES, default='Good')
    generated_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.project.title}"

class ContactQuery(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Query from {self.name} - {'Read' if self.is_read else 'Unread'}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    type = models.CharField(max_length=50, choices=[('Deadline', 'Deadline'), ('Escalation', 'Escalation'), ('Info', 'Info')], default='Info')
    escalation_level = models.IntegerField(default=0)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional relation to a task
    related_task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    def __str__(self):
        return f"[{self.type}] To {self.user.username}: {self.message}"
