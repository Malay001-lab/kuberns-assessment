"""
Celery tasks for kuberns deployment simulation
"""

import time
import random
from celery import shared_task
from django.utils import timezone
from .models import Instance, DeploymentLog


def add_log(instance, text):
    """
    Helper function to create timestamped logs.
    """
    DeploymentLog.objects.create(
        instance=instance,
        log_text=f"{timezone.now().strftime('%Y-%m-%d %H:%M:%S')} - {text}"
    )


@shared_task
def deploy_instance(instance_id):
    """
    Full deployment simulation engine:
    pending → deploying → provisioning → active
    """

    try:
        instance = Instance.objects.get(id=instance_id)

        
        add_log(instance, "[INFO] Deployment task received.")
        time.sleep(1)

        
        instance.status = "deploying"
        instance.save()
        add_log(instance, "[INFO] Deployment started...")
        time.sleep(3)

        
        instance.status = "provisioning"
        instance.save()
        add_log(instance, "[INFO] Provisioning cloud resources...")
        time.sleep(3)

        
        public_ip = provision_ec2_instance(instance)
        add_log(instance, f"[INFO] EC2 Instance provisioned. Assigned public IP: {public_ip}")
        time.sleep(2)

        
        instance.status = "active"
        instance.public_ip = public_ip
        instance.save()
        add_log(instance, "[SUCCESS] Deployment completed successfully!")
        time.sleep(1)

        return {
            "status": "success",
            "instance_id": str(instance_id),
            "public_ip": public_ip
        }

    except Exception as e:
        
        instance.status = "failed"
        instance.save()
        add_log(instance, f"[ERROR] Deployment failed: {str(e)}")

        return {"status": "failed", "error": str(e)}


def provision_ec2_instance(instance):
    """
    Mock AWS provisioning (boto3 simulation).
    In real project → Replace with boto3 EC2 run_instances().
    """

    
    add_log(instance, "[INFO] Initiating EC2 provisioning request...")

    
    time.sleep(2)

    
    public_ip = f"54.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"

    
    add_log(instance, f"[INFO] EC2 provision success. Instance running at {public_ip}")

    return public_ip
