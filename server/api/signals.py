from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Activity
from .services.timeline import TimelineService


@receiver(post_save, sender=Activity)
def update_daily_log_totals_on_save(sender, instance, created, **kwargs):
    """
    Recalculate daily log totals when activity is saved.
    Note: TimelineService already handles this, but this ensures it happens
    even if TimelineService is bypassed.
    """
    daily_log = instance.daily_log
    TimelineService._recalculate_totals(daily_log)


@receiver(post_delete, sender=Activity)
def update_daily_log_totals_on_delete(sender, instance, **kwargs):
    """
    Recalculate daily log totals when activity is deleted.
    Note: TimelineService.delete_activity already handles this, but this ensures
    it happens even if TimelineService is bypassed.
    """
    daily_log = instance.daily_log
    TimelineService._recalculate_totals(daily_log)

