from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProjectViewSet, TaskViewSet, ContactQueryViewSet, ReportViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'queries', ContactQueryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
