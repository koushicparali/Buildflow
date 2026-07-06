from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Project, Task, ContactQuery, Report, Notification, Milestone, ProjectFile, Inspection, NotificationPreference, ChangeRequest, ProjectRequest, Comment
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer, ContactQuerySerializer, ReportSerializer, NotificationSerializer, MilestoneSerializer, ProjectFileSerializer, InspectionSerializer, NotificationPreferenceSerializer, ChangeRequestSerializer, ProjectRequestSerializer, CommentSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.is_superuser:
            token['role'] = 'admin'
        else:
            token['role'] = user.role
        token['username'] = user.username
        token['profile_pic'] = user.profile_pic.url if user.profile_pic else None
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import update_session_auth_hash
from .serializers import ChangePasswordSerializer

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        if not user.check_password(serializer.validated_data.get('old_password')):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data.get('new_password'))
        user.save()
        # update_session_auth_hash(request, user)  # Not strictly needed for JWT, but good practice if using sessions
        return Response({"detail": "Password updated successfully."})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return Project.objects.all()
        elif user.role == 'pm':
            return Project.objects.filter(created_by=user)
        elif user.role == 'client':
            return Project.objects.filter(client=user)
        return Project.objects.none()

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return Task.objects.all()
        elif user.role == 'pm':
            return Task.objects.filter(project__created_by=user)
        elif user.role == 'engineer':
            return Task.objects.filter(assigned_engineer=user)
        elif user.role == 'client':
            return Task.objects.filter(project__client=user)
        return Task.objects.none()

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return Report.objects.all()
        elif user.role == 'pm':
            return Report.objects.filter(project__created_by=user)
        elif user.role == 'client':
            return Report.objects.filter(project__client=user)
        return Report.objects.none()

class ContactQueryViewSet(viewsets.ModelViewSet):
    queryset = ContactQuery.objects.all().order_by('-created_at')
    serializer_class = ContactQuerySerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_stats(request):
    return Response({
        'tasks_completed': Task.objects.filter(status='Completed').count(),
        'active_staff': User.objects.count(),
        'active_projects': Project.objects.filter(status='In Progress').count(),
    })

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        import datetime
        from django.utils import timezone
        
        # Cleanup expired or old notifications automatically
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        Notification.objects.filter(recipient=user, created_at__lt=thirty_days_ago, is_archived=False).update(is_archived=True)
        
        today = datetime.date.today()
        
        # Check overdue tasks
        overdue_tasks = Task.objects.filter(deadline__lt=today).exclude(status='Completed')
        
        for task in overdue_tasks:
            if task.assigned_engineer:
                Notification.objects.get_or_create(
                    recipient=task.assigned_engineer,
                    related_task=task,
                    title="Task Overdue",
                    message=f"Task '{task.title}' is OVERDUE (Deadline: {task.deadline}).",
                    defaults={'priority': 'High', 'category': 'Task', 'action_url': '/engineer'}
                )
            if task.project and task.project.created_by:
                Notification.objects.get_or_create(
                    recipient=task.project.created_by,
                    related_task=task,
                    title="Engineer Missed Deadline",
                    message=f"Engineer {task.assigned_engineer.username if task.assigned_engineer else 'Unassigned'} failed to finish task '{task.title}' on time.",
                    defaults={'priority': 'High', 'category': 'Task', 'action_url': '/pm'}
                )
            days_behind = (today - task.deadline).days
            if days_behind > 7:
                admins = User.objects.filter(role='admin')
                for admin in admins:
                    Notification.objects.get_or_create(
                        recipient=admin,
                        related_task=task,
                        title="Critical: Task Severely Delayed",
                        message=f"Task '{task.title}' is behind deadline by {days_behind} days!",
                        defaults={'priority': 'Critical', 'category': 'Project', 'action_url': '/admin'}
                    )
        
        # Check overdue projects
        overdue_projects = Project.objects.filter(deadline__lt=today - datetime.timedelta(days=7)).exclude(status='Completed')
        for proj in overdue_projects:
            admins = User.objects.filter(role='admin')
            days_behind = (today - proj.deadline).days
            for admin in admins:
                Notification.objects.get_or_create(
                    recipient=admin,
                    related_project=proj,
                    title="Critical: Project Delayed",
                    message=f"Project '{proj.title}' is behind deadline by {days_behind} days!",
                    defaults={'priority': 'Critical', 'category': 'Project', 'action_url': '/admin'}
                )

        return Notification.objects.filter(recipient=user, is_deleted=False).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'All notifications marked as read'})

    @action(detail=True, methods=['post'])
    def dismiss_popup(self, request, pk=None):
        notif = self.get_object()
        notif.popup_displayed = True
        notif.save()
        return Response({'status': 'Popup dismissed'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'Notification marked as read'})

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        notif = self.get_object()
        notif.is_archived = True
        notif.save()
        return Response({'status': 'Notification archived'})

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        Notification.objects.filter(recipient=request.user).update(is_deleted=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_deadlines(request):
    import datetime
    today = datetime.date.today()
    future = today + datetime.timedelta(days=30)
    
    user = request.user
    
    # Base querysets
    tasks = Task.objects.filter(deadline__range=[today, future]).exclude(status='Completed')
    projects = Project.objects.filter(deadline__range=[today, future]).exclude(status='Completed')
    
    # Filter based on role
    if user.is_superuser or user.role == 'admin':
        pass # see all
    elif user.role == 'pm':
        tasks = tasks.filter(project__created_by=user)
        projects = projects.filter(created_by=user)
    elif user.role == 'engineer':
        tasks = tasks.filter(assigned_engineer=user)
        projects = Project.objects.none() # Engineers don't directly own projects in this context
    
    task_data = TaskSerializer(tasks, many=True).data
    project_data = ProjectSerializer(projects, many=True).data
    
    return Response({
        'tasks': task_data,
        'projects': project_data
    })

class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return Milestone.objects.all()
        elif user.role == 'pm':
            return Milestone.objects.filter(project__created_by=user)
        elif user.role == 'client':
            return Milestone.objects.filter(project__client=user)
        return Milestone.objects.none()

class ProjectFileViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ProjectFile.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

class InspectionViewSet(viewsets.ModelViewSet):
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'admin':
            return Inspection.objects.all()
        elif user.role == 'pm':
            return Inspection.objects.filter(project__created_by=user)
        elif user.role == 'client':
            return Inspection.objects.filter(project__client=user)
        return Inspection.objects.none()

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    queryset = NotificationPreference.objects.all()
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

class ChangeRequestViewSet(viewsets.ModelViewSet):
    queryset = ChangeRequest.objects.all()
    serializer_class = ChangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def request_funds(self, request, pk=None):
        cr = self.get_object()
        funds = request.data.get('extra_funds', 0)
        try:
            funds = float(funds)
        except ValueError:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        cr.extra_funds_requested = funds
        cr.status = 'Pending Funds Approval'
        if 'remarks' in request.data:
            if request.user.role == 'pm':
                cr.pm_remarks = request.data['remarks']
            elif request.user.role == 'admin':
                cr.admin_remarks = request.data['remarks']
        cr.save()
        return Response(ChangeRequestSerializer(cr).data)

    @action(detail=True, methods=['post'])
    def respond_funds(self, request, pk=None):
        cr = self.get_object()
        action_type = request.data.get('action') # 'approve' or 'reject'
        
        if action_type == 'approve':
            cr.status = 'Approved'
            # Here you could potentially update project budget automatically, etc.
        elif action_type == 'reject':
            cr.status = 'Rejected'
            
        cr.save()
        return Response(ChangeRequestSerializer(cr).data)

class ProjectRequestViewSet(viewsets.ModelViewSet):
    queryset = ProjectRequest.objects.all()
    serializer_class = ProjectRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Comment.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Invoice.objects.all()
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task_id=task_id)
        return queryset

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        from django.http import HttpResponse
        from xhtml2pdf import pisa
        import io
        
        # Add basic styling to ensure it looks good in PDF
        html = f"""
        <html>
        <head>
            <style>
                @page {{ size: a4; margin: 2cm; }}
                body {{ font-family: Helvetica, sans-serif; color: #333; font-size: 14px; }}
                table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 12px; text-align: left; }}
                th {{ background-color: #f8f9fa; font-weight: bold; }}
                h1, h2, h3 {{ color: #222; }}
            </style>
        </head>
        <body>
            {invoice.content}
        </body>
        </html>
        """
        
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="invoice_{invoice.id}.pdf"'
        
        pisa_status = pisa.CreatePDF(html, dest=response)
        
        if pisa_status.err:
            return HttpResponse('We had some errors <pre>' + html + '</pre>')
        return response
