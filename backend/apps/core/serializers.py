from rest_framework import serializers
from .models import WebApp, Environment, Instance, DeploymentLog, DatabaseConfig





class DeploymentLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentLog
        fields = ['id', 'log_text', 'timestamp']
        read_only_fields = ['id', 'timestamp']





class InstanceSerializer(serializers.ModelSerializer):
    logs = DeploymentLogSerializer(many=True, read_only=True)

    class Meta:
        model = Instance
        fields = ['id', 'cpu', 'ram', 'storage', 'status', 'public_ip',
                  'created_at', 'updated_at', 'logs']
        read_only_fields = ['id', 'created_at', 'updated_at', 'logs']





class EnvironmentSerializer(serializers.ModelSerializer):
    instance = InstanceSerializer(read_only=True)

    class Meta:
        model = Environment
        fields = ['id', 'port', 'environment_variables',
                  'created_at', 'updated_at', 'instance']
        read_only_fields = ['id', 'created_at', 'updated_at']





class DatabaseConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatabaseConfig
        fields = ['id', 'engine', 'name', 'username', 'created_at']
        read_only_fields = ['id', 'created_at']





class WebAppListSerializer(serializers.ModelSerializer):
    environment = EnvironmentSerializer(read_only=True)
    database_config = DatabaseConfigSerializer(read_only=True)

    class Meta:
        model = WebApp
        fields = [
            'id', 'name', 'region', 'template', 'plan',
            'organization', 'repo', 'branch',
            'database_enabled', 'database_type',
            'created_at', 'updated_at',
            'environment', 'database_config'
        ]





class WebAppCreateSerializer(serializers.ModelSerializer):
    environment = serializers.DictField(required=True)
    database_config = serializers.DictField(required=False, allow_null=True)

    class Meta:
        model = WebApp
        fields = [
            'name', 'region', 'template', 'plan', 'organization',
            'repo', 'branch', 'database_enabled', 'database_type',
            'environment', 'database_config'
        ]

    
    
    
    def validate(self, data):
        
        if not data.get("name"):
            raise serializers.ValidationError({"name": "App name is required"})

        
        valid_regions = [r[0] for r in WebApp.REGION_CHOICES]
        if data["region"] not in valid_regions:
            raise serializers.ValidationError({"region": "Invalid region selected"})

        
        valid_frameworks = [f[0] for f in WebApp.FRAMEWORK_CHOICES]
        if data["template"] not in valid_frameworks:
            raise serializers.ValidationError({"template": "Invalid framework"})

        
        valid_plans = [p[0] for p in WebApp.PLAN_CHOICES]
        if data["plan"] not in valid_plans:
            raise serializers.ValidationError({"plan": "Invalid plan type"})

        
        if not data.get("repo"):
            raise serializers.ValidationError({"repo": "Repository is required"})
        if not data.get("branch"):
            raise serializers.ValidationError({"branch": "Branch is required"})

        
        env = data["environment"]

        
        port = env.get("port")
        if not isinstance(port, int) or port < 1024 or port > 65535:
            raise serializers.ValidationError({
                "environment": "Port must be between 1024 and 65535"
            })

        
        env_vars = env.get("environment_variables", {})
        if not isinstance(env_vars, dict):
            raise serializers.ValidationError({
                "environment": "environment_variables must be a dictionary"
            })

        for key, value in env_vars.items():
            if not key or not value:
                raise serializers.ValidationError({
                    "environment": f"Invalid environment variable: {key}={value}"
                })

        
        if data.get("database_enabled"):
            if not data.get("database_type"):
                raise serializers.ValidationError({
                    "database_type": "Database type required when enabled"
                })

            valid_db = [d[0] for d in WebApp.DATABASE_CHOICES]
            if data["database_type"] not in valid_db:
                raise serializers.ValidationError({
                    "database_type": "Invalid database type"
                })

        return data

    
    
    
    def create(self, validated_data):
        environment_data = validated_data.pop('environment')
        database_data = validated_data.pop('database_config', None)

        
        webapp = WebApp.objects.create(**validated_data)

        
        env = Environment.objects.create(
            webapp=webapp,
            port=environment_data['port'],
            environment_variables=environment_data.get('environment_variables', {})
        )

        
        plan = validated_data.get('plan')
        cpu, ram, storage = ('2', '4096', '100GB') if plan == 'pro' else ('0.5', '512', '10GB')

        
        Instance.objects.create(
            environment=env,
            cpu=cpu,
            ram=ram,
            storage=storage,
            status='pending'
        )

        
        if validated_data.get('database_enabled') and database_data is not None:
            DatabaseConfig.objects.create(
                webapp=webapp,
                engine=validated_data['database_type'],
                name=database_data.get("name", f"{webapp.name}_db"),
                username=database_data.get("username", "db_user")
            )

        return webapp





class WebAppDetailSerializer(serializers.ModelSerializer):
    environment = EnvironmentSerializer(read_only=True)
    database_config = DatabaseConfigSerializer(read_only=True)

    class Meta:
        model = WebApp
        fields = [
            'id', 'name', 'region', 'template', 'plan',
            'organization', 'repo', 'branch',
            'database_enabled', 'database_type',
            'created_at', 'updated_at',
            'environment', 'database_config'
        ]
