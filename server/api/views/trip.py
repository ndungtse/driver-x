from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiResponse

from ..models import Trip, TripStatus
from ..serializers import TripSerializer, TripDetailSerializer, TripCreateSerializer, TripUpdateSerializer, RouteSerializer
from ..response import success_response, error_response
from ..services.route_calculator import RouteCalculator
from ..services.trip_updater import TripUpdateService
from ..services.hos_validator import HOSValidator
from django.utils import timezone


class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing trips.
    
    CRUD operations:
    - GET /api/trips/ - list driver's trips
    - POST /api/trips/ - create new trip
    - GET /api/trips/{id}/ - retrieve trip details
    - PUT/PATCH /api/trips/{id}/ - update trip
    - DELETE /api/trips/{id}/ - delete trip
    
    Custom actions:
    - POST /api/trips/{id}/calculate-route/ - calculate route
    - GET /api/trips/{id}/hos-status/ - get HOS compliance status
    - POST /api/trips/{id}/start/ - start trip (change status to in_progress)
    - POST /api/trips/{id}/complete/ - complete trip (change status to completed)
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter trips by authenticated driver"""
        return Trip.objects.filter(driver=self.request.user.driver)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TripCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return TripUpdateSerializer
        elif self.action == 'retrieve':
            return TripDetailSerializer
        return TripSerializer
    
    def perform_create(self, serializer):
        """Auto-assign driver on creation"""
        serializer.save(driver=self.request.user.driver)
    
    def list(self, request, *args, **kwargs):
        """List trips with standardized response"""
        response = super().list(request, *args, **kwargs)
        return success_response(
            message='Trips retrieved successfully',
            data=response.data
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve trip with standardized response"""
        response = super().retrieve(request, *args, **kwargs)
        return success_response(
            message='Trip retrieved successfully',
            data=response.data
        )
    
    def create(self, request, *args, **kwargs):
        """Create trip with standardized response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        trip = serializer.instance
        
        # Calculate route distance on creation if locations are provided
        if trip.current_location and trip.dropoff_location:
            try:
                RouteCalculator.calculate_route(trip)
            except Exception:
                pass  # Don't fail trip creation if route calculation fails
        
        return success_response(
            message='Trip created successfully',
            data=TripDetailSerializer(trip).data,
            status_code=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        """Update trip with standardized response and recalculate distance"""
        trip = self.get_object()
        
        # Track which fields are being updated to check if locations changed
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(trip, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Check if locations changed before saving
        old_locations = {
            'current_location': trip.current_location,
            'pickup_location': trip.pickup_location,
            'dropoff_location': trip.dropoff_location,
        }
        
        serializer.save()
        trip.refresh_from_db()
        
        # Check if locations actually changed
        locations_changed = any(
            old_locations.get(field) != getattr(trip, field)
            for field in ['current_location', 'pickup_location', 'dropoff_location']
        )
        
        # Recalculate distance if locations changed
        if locations_changed and trip.current_location and trip.dropoff_location:
            try:
                RouteCalculator.calculate_route(trip)
                trip.refresh_from_db()
            except Exception:
                pass  # Don't fail update if route calculation fails
        
        return success_response(
            message='Trip updated successfully',
            data=TripDetailSerializer(trip).data
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete trip with standardized response"""
        super().destroy(request, *args, **kwargs)
        return success_response(
            message='Trip deleted successfully',
            status_code=status.HTTP_200_OK
        )
    
    @extend_schema(
        methods=['post'],
        description='Calculate route for trip',
        responses={200: OpenApiResponse(response=RouteSerializer, description='Route calculated')}
    )
    @action(detail=True, methods=['post'])
    def calculate_route(self, request, pk=None):
        """Calculate route and required stops for trip"""
        trip = self.get_object()
        
        try:
            route = RouteCalculator.calculate_route(trip)
            trip.refresh_from_db()
            
            return success_response(
                message='Route calculated successfully',
                data=RouteSerializer(route).data
            )
        except Exception as e:
            return error_response(
                message='Failed to calculate route',
                error={'detail': str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        methods=['get'],
        description='Get HOS compliance status for trip',
    )
    @action(detail=True, methods=['get'])
    def hos_status(self, request, pk=None):
        """Get Hours of Service compliance status"""
        trip = self.get_object()
        current_date = timezone.now().date()
        
        # Get latest daily log for this trip
        latest_log = trip.daily_logs.order_by('-date').first()
        
        if not latest_log:
            return success_response(
                message='No daily logs found for this trip',
                data={'compliant': True, 'violations': [], 'warnings': []}
            )
        
        # Get previous day's log
        previous_log = trip.daily_logs.filter(date__lt=latest_log.date).order_by('-date').first()
        
        compliance = HOSValidator.get_compliance_status(trip, latest_log, current_date)
        
        # Also check 10-hour rest
        rest_check = HOSValidator.validate_10_hour_rest(latest_log, previous_log)
        if rest_check:
            if rest_check['violated']:
                compliance['violations'].append(rest_check)
            else:
                compliance['warnings'].append(rest_check)
        
        compliance['compliant'] = len(compliance['violations']) == 0
        
        return success_response(
            message='HOS status retrieved successfully',
            data=compliance
        )
    
    @extend_schema(
        methods=['post'],
        description='Start trip (change status to in_progress)',
    )
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start trip"""
        trip = self.get_object()
        
        if trip.status != TripStatus.PLANNING:
            return error_response(
                message='Trip can only be started from planning status',
                error={'status': trip.status},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = TripStatus.IN_PROGRESS
        if not trip.start_datetime:
            trip.start_datetime = timezone.now()
        trip.save()
        
        return success_response(
            message='Trip started successfully',
            data=TripSerializer(trip).data
        )
    
    @extend_schema(
        methods=['post'],
        description='Complete trip (change status to completed)',
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete trip"""
        trip = self.get_object()
        
        if trip.status != TripStatus.IN_PROGRESS:
            return error_response(
                message='Trip can only be completed from in_progress status',
                error={'status': trip.status},
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        trip.status = TripStatus.COMPLETED
        if not trip.end_datetime:
            trip.end_datetime = timezone.now()
        trip.save()
        
        return success_response(
            message='Trip completed successfully',
            data=TripSerializer(trip).data
        )

