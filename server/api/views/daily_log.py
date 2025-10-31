from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated

from ..models import Trip, DailyLog
from ..serializers import (
    DailyLogSerializer,
    DailyLogCreateSerializer,
    DailyLogUpdateSerializer,
)
from ..response import success_response


class DailyLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing daily logs.
    
    Nested under trips:
    - GET /api/trips/{trip_id}/daily-logs/ - list logs for trip
    - POST /api/trips/{trip_id}/daily-logs/ - create new log
    - GET /api/daily-logs/{id}/ - retrieve log detail
    - PUT/PATCH /api/daily-logs/{id}/ - update log metadata
    - DELETE /api/daily-logs/{id}/ - delete log
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by trip if nested, or by driver"""
        trip_pk = self.kwargs.get('trip_pk')
        if trip_pk:
            return DailyLog.objects.filter(
                trip_id=trip_pk,
                trip__driver=self.request.user.driver
            )
        return DailyLog.objects.filter(trip__driver=self.request.user.driver)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DailyLogCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DailyLogUpdateSerializer
        return DailyLogSerializer
    
    def perform_create(self, serializer):
        """Auto-populate driver info from trip"""
        trip_pk = self.kwargs.get('trip_pk')
        if not trip_pk:
            raise ValueError('trip_pk is required for creating daily log')
        
        trip = Trip.objects.get(pk=trip_pk, driver=self.request.user.driver)
        driver = self.request.user.driver
        
        serializer.save(
            trip=trip,
            driver_name=self.request.user.get_full_name() or self.request.user.username,
            home_terminal=driver.home_terminal,
            carrier_name=driver.carrier_name
        )
    
    def list(self, request, *args, **kwargs):
        """List daily logs with standardized response"""
        response = super().list(request, *args, **kwargs)
        return success_response(
            message='Daily logs retrieved successfully',
            data=response.data
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve daily log with standardized response"""
        response = super().retrieve(request, *args, **kwargs)
        return success_response(
            message='Daily log retrieved successfully',
            data=response.data
        )
    
    def create(self, request, *args, **kwargs):
        """Create daily log with standardized response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        daily_log = serializer.instance
        return success_response(
            message='Daily log created successfully',
            data=DailyLogSerializer(daily_log).data,
            status_code=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update daily log with standardized response"""
        response = super().update(request, *args, **kwargs)
        return success_response(
            message='Daily log updated successfully',
            data=response.data
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete daily log with standardized response"""
        super().destroy(request, *args, **kwargs)
        return success_response(
            message='Daily log deleted successfully',
            status_code=status.HTTP_200_OK
        )

