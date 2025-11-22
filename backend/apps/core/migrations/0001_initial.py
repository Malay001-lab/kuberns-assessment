

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Environment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('port', models.IntegerField()),
                ('environment_variables', models.JSONField(default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='WebApp',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('region', models.CharField(choices=[('us-east-1', 'US East (N. Virginia)'), ('us-west-2', 'US West (Oregon)'), ('eu-central-1', 'EU (Frankfurt)')], max_length=20)),
                ('template', models.CharField(choices=[('reactjs', 'React.js'), ('nextjs', 'Next.js'), ('vue', 'Vue'), ('django', 'Django'), ('node', 'Node.js'), ('flask', 'Flask'), ('fastapi', 'FastAPI')], max_length=20)),
                ('plan', models.CharField(choices=[('starter', 'Starter'), ('pro', 'Pro')], max_length=20)),
                ('repo', models.CharField(max_length=255)),
                ('branch', models.CharField(max_length=255)),
                ('organization', models.CharField(blank=True, max_length=255, null=True)),
                ('database_type', models.CharField(choices=[('none', 'None'), ('postgresql', 'PostgreSQL'), ('mysql', 'MySQL')], default='none', max_length=20)),
                ('database_enabled', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Instance',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('cpu', models.CharField(max_length=20)),
                ('ram', models.CharField(max_length=20)),
                ('storage', models.CharField(max_length=20)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('deploying', 'Deploying'), ('provisioning', 'Provisioning'), ('active', 'Active'), ('failed', 'Failed')], default='pending', max_length=20)),
                ('public_ip', models.CharField(blank=True, max_length=50, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('environment', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='instance', to='core.environment')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='environment',
            name='webapp',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='environment', to='core.webapp'),
        ),
        migrations.CreateModel(
            name='DeploymentLog',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('log_text', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('instance', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='logs', to='core.instance')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='DatabaseConfig',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('engine', models.CharField(choices=[('postgresql', 'PostgreSQL'), ('mysql', 'MySQL')], max_length=20)),
                ('name', models.CharField(default='kuberns_db', max_length=255)),
                ('username', models.CharField(default='db_user', max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('webapp', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='database_config', to='core.webapp')),
            ],
        ),
    ]
