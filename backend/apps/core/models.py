"""
Models for kuberns core app
"""

from django.db import models
from django.contrib.auth.models import User
import uuid


class WebApp(models.Model):
    REGION_CHOICES = [
        ('us-east-1', 'US East (N. Virginia)'),
        ('us-west-2', 'US West (Oregon)'),
        ('eu-central-1', 'EU (Frankfurt)'),
    ]

    FRAMEWORK_CHOICES = [
        ('reactjs', 'React.js'),
        ('nextjs', 'Next.js'),
        ('vue', 'Vue'),
        ('django', 'Django'),
        ('node', 'Node.js'),
        ('flask', 'Flask'),
        ('fastapi', 'FastAPI'),
    ]

    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('pro', 'Pro'),
    ]

    DATABASE_CHOICES = [
        ('none', 'None'),
        ('postgresql', 'PostgreSQL'),
        ('mysql', 'MySQL'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=20, choices=REGION_CHOICES)
    template = models.CharField(max_length=20, choices=FRAMEWORK_CHOICES)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    repo = models.CharField(max_length=255)
    branch = models.CharField(max_length=255)
    organization = models.CharField(max_length=255, null=True, blank=True)
    database_type = models.CharField(max_length=20, choices=DATABASE_CHOICES, default='none')
    database_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class DatabaseConfig(models.Model):
    DATABASE_ENGINE_CHOICES = [
        ('postgresql', 'PostgreSQL'),
        ('mysql', 'MySQL'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    webapp = models.OneToOneField(WebApp, on_delete=models.CASCADE, related_name='database_config')
    engine = models.CharField(max_length=20, choices=DATABASE_ENGINE_CHOICES)
    name = models.CharField(max_length=255, default='kuberns_db')
    username = models.CharField(max_length=255, default='db_user')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.engine} - {self.webapp.name}"


class Environment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    webapp = models.OneToOneField(WebApp, on_delete=models.CASCADE, related_name='environment')
    port = models.IntegerField()
    environment_variables = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Environment for {self.webapp.name}"


class Instance(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('deploying', 'Deploying'),
        ('provisioning', 'Provisioning'),
        ('active', 'Active'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    environment = models.OneToOneField(Environment, on_delete=models.CASCADE, related_name='instance')
    cpu = models.CharField(max_length=20)
    ram = models.CharField(max_length=20)
    storage = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    public_ip = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Instance: {self.status}"


class DeploymentLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    instance = models.ForeignKey(Instance, on_delete=models.CASCADE, related_name='logs')
    log_text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Log for {self.instance.id}"
