from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Role Configuration', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Configuration', {'fields': ('role',)}),
    )

class TaskInline(admin.TabularInline):
    model = Task
    extra = 1

class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'created_by', 'deadline']
    list_filter = ['status', 'created_by']
    search_fields = ['title']
    inlines = [TaskInline]

class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'assigned_to', 'status', 'progress', 'deadline']
    list_filter = ['status', 'project', 'assigned_to']
    search_fields = ['title']

admin.site.register(User, CustomUserAdmin)
admin.site.register(Project, ProjectAdmin)
admin.site.register(Task, TaskAdmin)
