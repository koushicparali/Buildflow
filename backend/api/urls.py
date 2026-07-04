from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProjectViewSet, TaskViewSet, ContactQueryViewSet, ReportViewSet, NotificationViewSet, upcoming_deadlines

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'queries', ContactQueryViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('upcoming-deadlines/', upcoming_deadlines, name='upcoming_deadlines'),
]
