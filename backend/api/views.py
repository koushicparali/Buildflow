from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Project, Task, ContactQuery, Report, Notification
from .serializers import UserSerializer, ProjectSerializer, TaskSerializer, ContactQuerySerializer, ReportSerializer, NotificationSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        if user.is_superuser:
            token['role'] = 'admin'
        else:
            token['role'] = user.role
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

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
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

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
    elif user.role == 'contractor':
        tasks = tasks.filter(assigned_contractor=user)
        projects = projects.filter(assigned_contractors=user)
    
    task_data = TaskSerializer(tasks, many=True).data
    project_data = ProjectSerializer(projects, many=True).data
    
    return Response({
        'tasks': task_data,
        'projects': project_data
    })
