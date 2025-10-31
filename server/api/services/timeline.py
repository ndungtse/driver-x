from datetime import time, timedelta
from django.db import transaction
from django.core.exceptions import ValidationError

from ..models import Activity, ActivityStatus


class TimelineService:
    """
    Handles timeline cascade logic for activities.
    Ensures linear timeline with no gaps, handles insertion, updates, and deletions.
    """
    
    @staticmethod
    def _time_to_minutes(t: time) -> int:
        """Convert time to minutes since midnight"""
        return t.hour * 60 + t.minute
    
    @staticmethod
    def _minutes_to_time(minutes: int) -> time:
        """Convert minutes since midnight to time"""
        hours = (minutes // 60) % 24
        mins = minutes % 60
        return time(hours, mins)
    
    @staticmethod
    def _calculate_duration(start: time, end: time) -> int:
        """Calculate duration in minutes between two times (handling midnight crossing)"""
        start_mins = TimelineService._time_to_minutes(start)
        end_mins = TimelineService._time_to_minutes(end)
        
        if end_mins < start_mins:  # Crossed midnight
            end_mins += 24 * 60
        
        return end_mins - start_mins
    
    @staticmethod
    def _validate_24_hour_coverage(daily_log):
        """Ensure all activities cover exactly 24 hours"""
        activities = daily_log.activities.all().order_by('sequence', 'start_time')
        
        if not activities.exists():
            raise ValidationError('Daily log must have at least one activity')
        
        total_minutes = sum(a.duration_minutes for a in activities)
        if total_minutes != 24 * 60:
            raise ValidationError(f'Activities must total exactly 24 hours (currently {total_minutes} minutes)')
    
    @staticmethod
    @transaction.atomic
    def insert_activity(daily_log, activity_data, position=None):
        """
        Insert activity and cascade following activities forward.
        
        Args:
            daily_log: DailyLog instance
            activity_data: dict with activity fields
            position: optional sequence number to insert at (if None, appends at end)
        """
        start_time = activity_data.get('start_time')
        end_time = activity_data.get('end_time')
        
        if not start_time or not end_time:
            raise ValidationError('start_time and end_time are required')
        
        duration_minutes = TimelineService._calculate_duration(start_time, end_time)
        if duration_minutes <= 0:
            raise ValidationError('end_time must be after start_time')
        
        activities = list(daily_log.activities.all().order_by('sequence', 'start_time'))
        
        if position is None:
            position = len(activities)
        
        # Check if inserting in the middle
        if position < len(activities):
            # Get the activity at this position
            next_activity = activities[position]
            
            # Verify start_time doesn't overlap
            if TimelineService._time_to_minutes(start_time) >= TimelineService._time_to_minutes(next_activity.start_time):
                raise ValidationError(f'New activity start_time conflicts with existing activity at sequence {position}')
            
            # Calculate how much to shift following activities
            shift_minutes = duration_minutes
            
            # Shift all following activities forward
            for i in range(position, len(activities)):
                act = activities[i]
                old_start = TimelineService._time_to_minutes(act.start_time)
                new_start_minutes = (old_start + shift_minutes) % (24 * 60)
                new_end_minutes = (TimelineService._time_to_minutes(act.end_time) + shift_minutes) % (24 * 60)
                
                act.start_time = TimelineService._minutes_to_time(new_start_minutes)
                act.end_time = TimelineService._minutes_to_time(new_end_minutes)
                act.sequence = i + 1
                act.save()
        
        # Create new activity
        sequence = position
        new_activity = Activity.objects.create(
            daily_log=daily_log,
            status=activity_data.get('status'),
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration_minutes,
            location=activity_data.get('location', {}),
            remark=activity_data.get('remark', ''),
            miles_driven=activity_data.get('miles_driven'),
            sequence=sequence
        )
        
        # Recalculate totals
        TimelineService._recalculate_totals(daily_log)
        
        return new_activity
    
    @staticmethod
    @transaction.atomic
    def update_activity(activity, new_data):
        """
        Update activity and cascade changes to adjacent activities.
        
        Args:
            activity: Activity instance to update
            new_data: dict with updated fields
        """
        daily_log = activity.daily_log
        activities = list(daily_log.activities.all().order_by('sequence', 'start_time'))
        
        current_index = next(i for i, a in enumerate(activities) if a.id == activity.id)
        
        old_start = activity.start_time
        old_end = activity.end_time
        old_duration = activity.duration_minutes
        
        # Get new values
        new_start = new_data.get('start_time', old_start)
        new_end = new_data.get('end_time', old_end)
        new_duration = TimelineService._calculate_duration(new_start, new_end)
        
        if new_duration <= 0:
            raise ValidationError('end_time must be after start_time')
        
        # Calculate shift needed
        duration_diff = new_duration - old_duration
        
        # If duration changed, cascade
        if duration_diff != 0:
            if duration_diff > 0:
                # Extended - shift following activities forward
                shift_index = current_index + 1
            else:
                # Shortened - pull following activities backward
                shift_index = current_index + 1
            
            for i in range(shift_index, len(activities)):
                act = activities[i]
                old_act_start = TimelineService._time_to_minutes(act.start_time)
                new_act_start_minutes = (old_act_start + duration_diff) % (24 * 60)
                old_act_end = TimelineService._time_to_minutes(act.end_time)
                new_act_end_minutes = (old_act_end + duration_diff) % (24 * 60)
                
                act.start_time = TimelineService._minutes_to_time(new_act_start_minutes)
                act.end_time = TimelineService._minutes_to_time(new_act_end_minutes)
                act.save()
        
        # Update the activity
        for key, value in new_data.items():
            if hasattr(activity, key):
                setattr(activity, key, value)
        
        activity.duration_minutes = new_duration
        activity.save()
        
        # Recalculate totals
        TimelineService._recalculate_totals(daily_log)
        
        return activity
    
    @staticmethod
    @transaction.atomic
    def delete_activity(activity):
        """
        Delete activity and extend previous activity to fill gap.
        
        Args:
            activity: Activity instance to delete
        """
        daily_log = activity.daily_log
        activities = list(daily_log.activities.all().order_by('sequence', 'start_time'))
        
        if len(activities) == 1:
            raise ValidationError('Cannot delete the only activity in a daily log')
        
        current_index = next(i for i, a in enumerate(activities) if a.id == activity.id)
        
        if current_index == 0:
            # Deleting first activity - extend next one backward
            next_activity = activities[1]
            deleted_duration = activity.duration_minutes
            
            old_start = TimelineService._time_to_minutes(next_activity.start_time)
            new_start_minutes = (old_start - deleted_duration) % (24 * 60)
            next_activity.start_time = TimelineService._minutes_to_time(new_start_minutes)
            next_activity.duration_minutes += deleted_duration
            next_activity.save()
        else:
            # Deleting middle/last activity - extend previous one forward
            prev_activity = activities[current_index - 1]
            deleted_duration = activity.duration_minutes
            
            prev_activity.end_time = activity.end_time
            prev_activity.duration_minutes += deleted_duration
            prev_activity.save()
            
            # Shift all following activities backward
            for i in range(current_index + 1, len(activities)):
                act = activities[i]
                old_start = TimelineService._time_to_minutes(act.start_time)
                old_end = TimelineService._time_to_minutes(act.end_time)
                new_start_minutes = (old_start - deleted_duration) % (24 * 60)
                new_end_minutes = (old_end - deleted_duration) % (24 * 60)
                
                act.start_time = TimelineService._minutes_to_time(new_start_minutes)
                act.end_time = TimelineService._minutes_to_time(new_end_minutes)
                act.sequence = i - 1
                act.save()
        
        # Delete the activity
        activity.delete()
        
        # Recalculate totals
        TimelineService._recalculate_totals(daily_log)
    
    @staticmethod
    def _recalculate_totals(daily_log):
        """Recalculate daily log totals from activities"""
        activities = daily_log.activities.all()
        
        totals = {
            'off_duty': 0,
            'sleeper_berth': 0,
            'driving': 0,
            'on_duty_not_driving': 0,
        }
        
        total_miles = 0.0
        
        for activity in activities:
            minutes = activity.duration_minutes
            hours = minutes / 60.0
            
            if activity.status == ActivityStatus.OFF_DUTY:
                totals['off_duty'] += hours
            elif activity.status == ActivityStatus.SLEEPER_BERTH:
                totals['sleeper_berth'] += hours
            elif activity.status == ActivityStatus.DRIVING:
                totals['driving'] += hours
                if activity.miles_driven:
                    total_miles += activity.miles_driven
            elif activity.status == ActivityStatus.ON_DUTY_NOT_DRIVING:
                totals['on_duty_not_driving'] += hours
        
        # Update daily log
        daily_log.off_duty_hours = totals['off_duty']
        daily_log.sleeper_berth_hours = totals['sleeper_berth']
        daily_log.driving_hours = totals['driving']
        daily_log.on_duty_not_driving_hours = totals['on_duty_not_driving']
        daily_log.total_miles_driven = total_miles
        daily_log.total_truck_mileage = total_miles
        daily_log.save()
    
    @staticmethod
    def validate_timeline_completeness(daily_log):
        """
        Ensure 24-hour coverage with no gaps.
        Raises ValidationError if timeline is incomplete.
        """
        TimelineService._validate_24_hour_coverage(daily_log)

