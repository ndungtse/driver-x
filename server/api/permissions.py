from rest_framework import permissions
from .models import DriverRole


class IsDriverOwner(permissions.BasePermission):
    """Check if user owns the resource through driver relationship"""
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        driver = getattr(request.user, 'driver', None)
        if not driver:
            return False
        
        if hasattr(obj, 'driver'):
            return obj.driver == driver
        elif hasattr(obj, 'trip'):
            return obj.trip.driver == driver
        elif hasattr(obj, 'daily_log'):
            return obj.daily_log.trip.driver == driver
        
        return False


class IsAdminOrDriverOwner(permissions.BasePermission):
    """Admin can access all, drivers only their own resources"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        driver = getattr(request.user, 'driver', None)
        return driver is not None
    
    def has_object_permission(self, request, view, obj):
        driver = getattr(request.user, 'driver', None)
        if not driver:
            return False
        
        if driver.role == DriverRole.ADMIN:
            return True
        
        if hasattr(obj, 'driver'):
            return obj.driver == driver
        elif hasattr(obj, 'trip'):
            return obj.trip.driver == driver
        elif hasattr(obj, 'daily_log'):
            return obj.daily_log.trip.driver == driver
        
        return False

