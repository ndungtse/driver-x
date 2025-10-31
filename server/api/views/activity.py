from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError

from ..models import DailyLog, Activity
from ..serializers import (
    ActivitySerializer,
    ActivityCreateSerializer,
    ActivityUpdateSerializer,
)
from ..response import success_response, error_response
from ..services.timeline import TimelineService
from ..services.hos_validator import HOSValidator


class ActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing activities.
    
    Nested under daily-logs:
    - GET /api/daily-logs/{log_id}/activities/ - list activities
    - POST /api/daily-logs/{log_id}/activities/ - create activity (with cascade)
    - GET /api/activities/{id}/ - retrieve activity
    - PUT/PATCH /api/activities/{id}/ - update activity (with cascade)
    - DELETE /api/activities/{id}/ - delete activity (extend previous)
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by daily log if nested, or by driver"""
        daily_log_pk = self.kwargs.get('daily_log_pk')
        if daily_log_pk:
            return Activity.objects.filter(
                daily_log_id=daily_log_pk,
                daily_log__trip__driver=self.request.user.driver
            )
        return Activity.objects.filter(daily_log__trip__driver=self.request.user.driver)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ActivityCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ActivityUpdateSerializer
        return ActivitySerializer
    
    def perform_create(self, serializer):
        """Create activity using TimelineService to handle cascade"""
        daily_log_pk = self.kwargs.get('daily_log_pk')
        if not daily_log_pk:
            raise ValueError('daily_log_pk is required for creating activity')
        
        daily_log = DailyLog.objects.get(
            pk=daily_log_pk,
            trip__driver=self.request.user.driver
        )
        
        activity_data = serializer.validated_data
        
        try:
            activity = TimelineService.insert_activity(daily_log, activity_data)
            serializer.instance = activity
        except ValidationError as e:
            raise ValidationError(str(e))
    
    def perform_update(self, serializer):
        """Update activity using TimelineService for cascade logic"""
        activity = self.get_object()
        activity_data = serializer.validated_data
        
        try:
            TimelineService.update_activity(activity, activity_data)
        except ValidationError as e:
            raise ValidationError(str(e))
    
    def perform_destroy(self, instance):
        """Delete activity using TimelineService to fill gap"""
        try:
            TimelineService.delete_activity(instance)
        except ValidationError as e:
            raise ValidationError(str(e))
    
    def list(self, request, *args, **kwargs):
        """List activities with standardized response"""
        response = super().list(request, *args, **kwargs)
        
        # Get compliance status
        daily_log_pk = self.kwargs.get('daily_log_pk')
        if daily_log_pk:
            try:
                daily_log = DailyLog.objects.get(pk=daily_log_pk)
                compliance = HOSValidator.get_compliance_status(
                    daily_log.trip,
                    daily_log,
                    daily_log.date
                )
                return success_response(
                    message='Activities retrieved successfully',
                    data={
                        'activities': response.data,
                        'hos_compliance': compliance
                    }
                )
            except DailyLog.DoesNotExist:
                pass
        
        return success_response(
            message='Activities retrieved successfully',
            data=response.data
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve activity with standardized response"""
        response = super().retrieve(request, *args, **kwargs)
        return success_response(
            message='Activity retrieved successfully',
            data=response.data
        )
    
    def create(self, request, *args, **kwargs):
        """Create activity with standardized response"""
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            activity = serializer.instance
            
            # Check HOS compliance after creation
            daily_log = activity.daily_log
            compliance = HOSValidator.get_compliance_status(
                daily_log.trip,
                daily_log,
                daily_log.date
            )
            
            return success_response(
                message='Activity created successfully',
                data={
                    'activity': ActivitySerializer(activity).data,
                    'hos_compliance': compliance
                },
                status_code=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return error_response(
                message='Failed to create activity',
                error={'detail': str(e)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update activity with standardized response"""
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            activity = self.get_object()
            
            # Check HOS compliance after update
            daily_log = activity.daily_log
            compliance = HOSValidator.get_compliance_status(
                daily_log.trip,
                daily_log,
                daily_log.date
            )
            
            return success_response(
                message='Activity updated successfully',
                data={
                    'activity': ActivitySerializer(activity).data,
                    'hos_compliance': compliance
                }
            )
        except ValidationError as e:
            return error_response(
                message='Failed to update activity',
                error={'detail': str(e)},
                status_code=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Delete activity with standardized response"""
        instance = self.get_object()
        
        try:
            self.perform_destroy(instance)
            return success_response(
                message='Activity deleted successfully',
                status_code=status.HTTP_200_OK
            )
        except ValidationError as e:
            return error_response(
                message='Failed to delete activity',
                error={'detail': str(e)},
                status_code=status.HTTP_400_BAD_REQUEST
            )

