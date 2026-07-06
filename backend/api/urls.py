from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ProjectViewSet, TaskViewSet, ContactQueryViewSet, ReportViewSet, NotificationViewSet, upcoming_deadlines, MilestoneViewSet, ProjectFileViewSet, InspectionViewSet, NotificationPreferenceViewSet, ChangeRequestViewSet, ProjectRequestViewSet, CommentViewSet, InvoiceViewSet, update_profile, change_password

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'queries', ContactQueryViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'milestones', MilestoneViewSet, basename='milestone')
router.register(r'project-files', ProjectFileViewSet, basename='projectfile')
router.register(r'inspections', InspectionViewSet, basename='inspection')
router.register(r'notification-preferences', NotificationPreferenceViewSet)
router.register(r'change-requests', ChangeRequestViewSet)
router.register(r'project-requests', ProjectRequestViewSet)
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
    path('upcoming-deadlines/', upcoming_deadlines, name='upcoming_deadlines'),
    path('users/me/update/', update_profile, name='update_profile'),
    path('users/me/change-password/', change_password, name='change_password'),
]
