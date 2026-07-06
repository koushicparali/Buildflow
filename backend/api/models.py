from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('pm', 'Project Manager'),
        ('engineer', 'Engineer'),
        ('client', 'Client'),
        ('unassigned', 'Unassigned'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='unassigned')
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    client = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='client_projects')
    
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
    
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    progress = models.IntegerField(default=0) # 0 to 100 percentage
    start_date = models.DateField(blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='task_images/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.status == 'Pending':
            self.progress = 0
        elif self.status == 'Completed':
            self.progress = 100
        super(Task, self).save(*args, **kwargs)

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
    PRIORITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]

    CATEGORY_CHOICES = [
        ('Project', 'Project'),
        ('Task', 'Task'),
        ('Approval', 'Approval'),
        ('Budget', 'Budget'),
        ('Client', 'Client'),
        ('Inspection', 'Inspection'),
        ('Equipment', 'Equipment'),
        ('Material', 'Material'),
        ('Daily Log', 'Daily Log'),
        ('Report', 'Report'),
        ('Comment', 'Comment'),
        ('Discussion', 'Discussion'),
        ('Activity', 'Activity'),
        ('Security', 'Security'),
        ('System', 'System'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    title = models.CharField(max_length=200)
    message = models.TextField() # Represents the description
    priority = models.CharField(max_length=50, choices=PRIORITY_CHOICES, default='Medium')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='System')
    action_url = models.CharField(max_length=500, blank=True, null=True)
    
    is_read = models.BooleanField(default=False)
    popup_displayed = models.BooleanField(default=False)
    sound_played = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    
    related_task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    related_project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='project_notifications')

    def __str__(self):
        return f"[{self.priority}] {self.title} to {self.recipient.username}"

class Milestone(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    completion_percentage = models.IntegerField(default=0)
    due_date = models.DateField(blank=True, null=True)
    actual_completion_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('In Progress', 'In Progress'), ('Completed', 'Completed')], default='Pending')
    
    def __str__(self):
        return f"{self.title} - {self.project.title}"

class ProjectFile(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='files')
    uploader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    file_type = models.CharField(max_length=50, choices=[('Image', 'Image'), ('Document', 'Document')], default='Document')
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='project_files/', null=True, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.category} File for {self.project.title}"

class Inspection(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='inspections')
    inspector = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='conducted_inspections')
    type = models.CharField(max_length=100)
    date = models.DateField()
    status = models.CharField(max_length=50, choices=[('Passed', 'Passed'), ('Failed', 'Failed'), ('Pending Corrective Action', 'Pending Corrective Action')])
    findings = models.TextField()
    corrective_actions = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.type} Inspection for {self.project.title}"

class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    task_completion = models.BooleanField(default=True)
    milestone_completion = models.BooleanField(default=True)
    project_updates = models.BooleanField(default=True)
    change_request_updates = models.BooleanField(default=True)
    document_uploads = models.BooleanField(default=True)
    popup_notifications = models.BooleanField(default=True)
    notification_sounds = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Preferences for {self.user.username}"

class ChangeRequest(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='change_requests')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_change_requests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100, blank=True, null=True)
    priority = models.CharField(max_length=50, choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High'), ('Critical', 'Critical')], default='Medium')
    requested_deadline = models.DateField(blank=True, null=True)
    estimated_impact = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Under Review', 'Under Review'), ('Pending Funds Approval', 'Pending Funds Approval'), ('Approved', 'Approved'), ('Rejected', 'Rejected'), ('In Progress', 'In Progress'), ('Completed', 'Completed')], default='Pending')
    extra_funds_requested = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    pm_remarks = models.TextField(blank=True, null=True)
    admin_remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"CR: {self.title} for {self.project.title}"

class ProjectRequest(models.Model):
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_project_requests')
    name = models.CharField(max_length=200)
    project_type = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    estimated_budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    timeline = models.CharField(max_length=100)
    description = models.TextField()
    priority = models.CharField(max_length=50, choices=[('Low', 'Low'), ('Medium', 'Medium'), ('High', 'High')], default='Medium')
    status = models.CharField(max_length=50, choices=[('Pending', 'Pending'), ('Info Requested', 'Info Requested'), ('Approved', 'Approved'), ('Rejected', 'Rejected')], default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Project Request: {self.name} by {self.submitted_by.username}"

class Comment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    parent_comment = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    read_by = models.ManyToManyField(User, related_name='read_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.project.title}"

class Invoice(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='invoices')
    task = models.OneToOneField(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    content = models.TextField() # HTML or Markdown generated by AI
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice for {self.task.title if self.task else 'Project'} - ₹{self.total_amount}"
