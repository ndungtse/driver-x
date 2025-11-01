from django.db.models import Sum
from ..models import Trip, Activity, ActivityStatus


class TripUpdateService:
    """
    Service to update trip fields automatically when activities change.
    """
    
    @staticmethod
    def update_current_location(trip):
        """
        Update trip's current_location to the latest activity's location.
        Uses end_location if available, otherwise uses location.
        
        Args:
            trip: Trip instance
        """
        # Get all activities across all daily logs for this trip, ordered by date and time
        latest_activity = Activity.objects.filter(
            daily_log__trip=trip
        ).order_by('-daily_log__date', '-end_time', '-sequence').first()
        
        if latest_activity:
            # Prefer end_location, fall back to location
            # Check if end_location has actual data (not just empty dict)
            end_location = latest_activity.end_location or {}
            location = end_location if (end_location.get('latitude') or end_location.get('address')) else latest_activity.location
            
            if location and (location.get('latitude') or location.get('address')):
                trip.current_location = location
                trip.save(update_fields=['current_location'])
    
    @staticmethod
    def update_current_cycle_hours(trip):
        """
        Update trip's current_cycle_hours by summing all driving hours
        from activities across all daily logs.
        
        Args:
            trip: Trip instance
        """
        # Sum all driving hours from activities
        total_minutes = Activity.objects.filter(
            daily_log__trip=trip,
            status=ActivityStatus.DRIVING
        ).aggregate(
            total=Sum('duration_minutes')
        )['total'] or 0
        
        # Convert minutes to hours
        total_hours = total_minutes / 60.0
        
        trip.current_cycle_hours = total_hours
        trip.save(update_fields=['current_cycle_hours'])
    
    @staticmethod
    def recalculate_total_distance(trip):
        """
        Recalculate trip's total_distance using RouteCalculator.
        
        Args:
            trip: Trip instance
        """
        from .route_calculator import RouteCalculator
        RouteCalculator.calculate_route(trip)
    
    @staticmethod
    def update_all_fields(trip):
        """
        Update all trip fields that depend on activities.
        
        Args:
            trip: Trip instance
        """
        TripUpdateService.update_current_location(trip)
        TripUpdateService.update_current_cycle_hours(trip)

