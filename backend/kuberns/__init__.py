"""
kuberns package
"""

default_app_config = 'kuberns.apps.KubernsConfig'



from .celery import app as celery_app

__all__ = ('celery_app',)
