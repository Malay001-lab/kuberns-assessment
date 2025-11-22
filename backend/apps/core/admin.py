"""
Admin configuration for core app
"""

from django.contrib import admin
from .models import WebApp, Environment, Instance, DeploymentLog, DatabaseConfig


@admin.register(WebApp)
class WebAppAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'region', 'template', 'plan', 'database_enabled', 'created_at']
    list_filter = ['region', 'template', 'plan', 'created_at']
    search_fields = ['name', 'organization', 'repo']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Environment)
class EnvironmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'webapp', 'port', 'created_at']
    search_fields = ['webapp__name']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Instance)
class InstanceAdmin(admin.ModelAdmin):
    list_display = ['id', 'environment', 'cpu', 'ram', 'status', 'public_ip', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['environment__webapp__name', 'public_ip']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(DeploymentLog)
class DeploymentLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'instance', 'timestamp']
    list_filter = ['timestamp']
    search_fields = ['instance__id']
    readonly_fields = ['id', 'timestamp']


@admin.register(DatabaseConfig)
class DatabaseConfigAdmin(admin.ModelAdmin):
    list_display = ['id', 'webapp', 'engine', 'name', 'created_at']
    list_filter = ['engine', 'created_at']
    search_fields = ['webapp__name']
    readonly_fields = ['id', 'created_at']
