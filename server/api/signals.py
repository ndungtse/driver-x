from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Activity, Trip
from .services.timeline import TimelineService
from .services.trip_updater import TripUpdateService


@receiver(post_save, sender=Activity)
def update_daily_log_totals_on_save(sender, instance, created, **kwargs):
    """
    Recalculate daily log totals when activity is saved.
    Note: TimelineService already handles this, but this ensures it happens
    even if TimelineService is bypassed.
    Also updates trip fields that depend on activities.
    """
    daily_log = instance.daily_log
    TimelineService._recalculate_totals(daily_log)
    
    # Update trip fields based on activities
    trip = daily_log.trip
    TripUpdateService.update_all_fields(trip)


@receiver(post_delete, sender=Activity)
def update_daily_log_totals_on_delete(sender, instance, **kwargs):
    """
    Recalculate daily log totals when activity is deleted.
    Note: TimelineService.delete_activity already handles this, but this ensures
    it happens even if TimelineService is bypassed.
    Also updates trip fields that depend on activities.
    """
    daily_log = instance.daily_log
    TimelineService._recalculate_totals(daily_log)
    
    # Update trip fields based on activities
    trip = daily_log.trip
    TripUpdateService.update_all_fields(trip)


@receiver(post_save, sender=Trip)
def update_trip_distance_on_location_change(sender, instance, created, **kwargs):
    """
    Recalculate trip distance when locations change.
    """
    if not created:
        # Check if locations changed by looking at update_fields
        update_fields = kwargs.get('update_fields')
        if update_fields and any(
            field in update_fields
            for field in ['current_location', 'pickup_location', 'dropoff_location']
        ):
            TripUpdateService.recalculate_total_distance(instance)

