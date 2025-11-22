from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WebAppViewSet,
    EnvironmentViewSet,
    InstanceViewSet,
    DeploymentLogViewSet,
     metadata
)

router = DefaultRouter()
router.register('webapps', WebAppViewSet, basename='webapp')
router.register('environments', EnvironmentViewSet, basename='environment')
router.register('instances', InstanceViewSet, basename='instance')
router.register('logs', DeploymentLogViewSet, basename='logs')

urlpatterns = [
    path('metadata/', metadata),
    path('', include(router.urls)),
]
