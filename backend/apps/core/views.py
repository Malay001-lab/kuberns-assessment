"""
Views for kuberns core app
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import WebApp, Environment, Instance, DeploymentLog
from .serializers import (
    WebAppListSerializer, WebAppCreateSerializer, WebAppDetailSerializer,
    EnvironmentSerializer, InstanceSerializer, DeploymentLogSerializer
)
from .tasks import deploy_instance





@api_view(['GET'])
def metadata(request):
    return Response({
        "regions": WebApp.REGION_CHOICES,
        "frameworks": WebApp.FRAMEWORK_CHOICES,
        "plans": WebApp.PLAN_CHOICES,

        
        "plan_details": {
            "starter": {
                "cpu": "0.5 vCPU",
                "ram": "512MB",
                "bandwidth": "10GB/mo",
                "price": "$10/mo"
            },
            "pro": {
                "cpu": "2 vCPU",
                "ram": "4GB",
                "bandwidth": "Unlimited",
                "price": "$50/mo"
            }
        },

        "database_types": WebApp.DATABASE_CHOICES,
    })






class WebAppViewSet(viewsets.ModelViewSet):
    queryset = WebApp.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return WebAppCreateSerializer
        elif self.action == 'retrieve':
            return WebAppDetailSerializer
        return WebAppListSerializer

    def create(self, request, *args, **kwargs):
        """
        Create WebApp -> create Environment -> create Instance ->
        THEN start async deployment pipeline via Celery.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        webapp = serializer.save()

        
        deploy_instance.delay(str(webapp.environment.instance.id))

        return Response({
            "message": "WebApp created successfully",
            "status": "deployment started",
            "id": str(webapp.id),
            "data": WebAppDetailSerializer(webapp).data
        }, status=status.HTTP_201_CREATED)

    
    
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Returns live deployment status + latest logs.
        This is used by the frontend deployment dashboard.
        """
        webapp = self.get_object()
        instance = webapp.environment.instance

        logs = instance.logs.order_by('-timestamp')[:20]  

        return Response({
            "id": str(webapp.id),
            "name": webapp.name,
            "instance_status": instance.status,
            "public_ip": instance.public_ip,
            "logs": DeploymentLogSerializer(logs, many=True).data,
        })

    
    
    
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """
        Returns ALL logs in chronological order.
        """
        webapp = self.get_object()
        instance = webapp.environment.instance

        logs = instance.logs.order_by('timestamp')  

        return Response({
            "id": str(webapp.id),
            "logs": DeploymentLogSerializer(logs, many=True).data,
        })





class EnvironmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Environment.objects.all()
    serializer_class = EnvironmentSerializer
    permission_classes = [AllowAny]


class InstanceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Instance.objects.all()
    serializer_class = InstanceSerializer
    permission_classes = [AllowAny]


class DeploymentLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeploymentLog.objects.all()
    serializer_class = DeploymentLogSerializer
    permission_classes = [AllowAny]
