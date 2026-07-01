from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task, ContactQuery, Report

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('role',)}),
    )

class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'status', 'deadline', 'budget', 'location')
    list_filter = ('status', 'created_by')
    search_fields = ('title', 'description', 'location')

class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'assigned_engineer', 'assigned_contractor', 'status', 'progress', 'priority')
    list_filter = ('status', 'project', 'assigned_engineer', 'assigned_contractor', 'priority')
    search_fields = ('title', 'description')

class ReportAdmin(admin.ModelAdmin):
    list_display = ('project', 'health', 'completion_percentage', 'generated_date')
    list_filter = ('health',)

class ContactQueryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'message')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Task, TaskAdmin)
admin.site.register(Report, ReportAdmin)
admin.site.register(ContactQuery, ContactQueryAdmin)
