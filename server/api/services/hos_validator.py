from datetime import timedelta
from django.utils import timezone
from ..models import ActivityStatus


class HOSValidator:
    """
    Validates Hours of Service (HOS) compliance per FMCSA regulations.
    All rules apply to property-carrying drivers with 70-hour/8-day cycle.
    """
    
    @staticmethod
    def validate_11_hour_limit(daily_log):
        """
        Check driving time <= 11 hours per shift.
        
        Returns:
            dict with 'violated', 'message', 'severity' if violation/warning, else None
        """
        total_driving = sum(
            a.duration_minutes for a in daily_log.activities.all()
            if a.status == ActivityStatus.DRIVING
        )
        
        max_driving_minutes = 11 * 60  # 660 minutes
        
        if total_driving > max_driving_minutes:
            return {
                'violated': True,
                'message': f'Driving time ({total_driving/60:.1f}h) exceeds 11-hour limit',
                'severity': 'error',
                'rule': '11_hour_limit'
            }
        elif total_driving > max_driving_minutes - 30:  # Within 30 min of limit
            return {
                'violated': False,
                'message': f'Approaching 11-hour limit ({(max_driving_minutes - total_driving)/60:.1f}h remaining)',
                'severity': 'warning',
                'rule': '11_hour_limit'
            }
        
        return None
    
    @staticmethod
    def _find_duty_period_start(daily_log):
        """Find start of duty period (first non-off-duty activity after 10+ hr off)"""
        activities = list(daily_log.activities.all().order_by('sequence', 'start_time'))
        
        consecutive_off_duty = 0
        for activity in activities:
            if activity.status in [ActivityStatus.OFF_DUTY, ActivityStatus.SLEEPER_BERTH]:
                consecutive_off_duty += activity.duration_minutes
            else:
                if consecutive_off_duty >= 10 * 60:  # 10 hours off
                    return activity.start_time
                consecutive_off_duty = 0
        
        return activities[0].start_time if activities else None
    
    @staticmethod
    def _get_last_driving_activity(daily_log):
        """Get the last driving activity in the log"""
        driving_activities = daily_log.activities.filter(
            status=ActivityStatus.DRIVING
        ).order_by('-sequence', '-end_time')
        
        return driving_activities.first()
    
    @staticmethod
    def _time_to_minutes(t):
        """Convert time to minutes since midnight"""
        return t.hour * 60 + t.minute
    
    @staticmethod
    def _calculate_duration(start, end):
        """Calculate duration in minutes between two times"""
        start_mins = HOSValidator._time_to_minutes(start)
        end_mins = HOSValidator._time_to_minutes(end)
        
        if end_mins < start_mins:
            end_mins += 24 * 60
        
        return end_mins - start_mins
    
    @staticmethod
    def validate_14_hour_window(daily_log):
        """
        Check driving within 14-hour window from start of duty.
        
        Returns:
            dict with violation info if violated, else None
        """
        duty_start = HOSValidator._find_duty_period_start(daily_log)
        if not duty_start:
            return None
        
        last_driving = HOSValidator._get_last_driving_activity(daily_log)
        if not last_driving:
            return None
        
        time_since_duty_start = HOSValidator._calculate_duration(duty_start, last_driving.end_time)
        
        if time_since_duty_start > 14 * 60:  # 840 minutes
            return {
                'violated': True,
                'message': f'Driving after 14-hour window ({time_since_duty_start/60:.1f}h since starting duty)',
                'severity': 'error',
                'rule': '14_hour_window'
            }
        
        return None
    
    @staticmethod
    def validate_30_minute_break(daily_log):
        """
        Check 30-minute break required after 8 hours driving.
        
        Returns:
            dict with violation info if violated, else None
        """
        activities = daily_log.activities.all().order_by('sequence', 'start_time')
        driving_time_since_break = 0
        
        for activity in activities:
            if activity.status == ActivityStatus.DRIVING:
                driving_time_since_break += activity.duration_minutes
                
                if driving_time_since_break > 8 * 60:  # 480 minutes
                    return {
                        'violated': True,
                        'message': 'Drove more than 8 hours without 30-minute break',
                        'severity': 'error',
                        'rule': '30_minute_break',
                        'suggestion': 'Log a 30-minute off-duty or sleeper berth break'
                    }
            else:
                # Break qualifies if 30+ consecutive minutes not driving
                if activity.duration_minutes >= 30:
                    driving_time_since_break = 0  # Reset counter
        
        return None
    
    @staticmethod
    def validate_70_hour_cycle(trip, current_date):
        """
        Check 70-hour/8-day limit.
        
        Args:
            trip: Trip instance
            current_date: datetime.date of current day
            
        Returns:
            dict with violation info if violated/warned, else None
        """
        from datetime import timedelta
        from ..models import DailyLog, ActivityStatus
        
        # Get last 8 days of logs
        start_date = current_date - timedelta(days=7)
        eight_days_logs = DailyLog.objects.filter(
            trip=trip,
            date__gte=start_date,
            date__lte=current_date
        )
        
        total_on_duty_minutes = 0
        
        for daily_log in eight_days_logs:
            for activity in daily_log.activities.all():
                if activity.status in [ActivityStatus.DRIVING, ActivityStatus.ON_DUTY_NOT_DRIVING]:
                    total_on_duty_minutes += activity.duration_minutes
        
        max_minutes = 70 * 60  # 4200 minutes
        
        if total_on_duty_minutes > max_minutes:
            return {
                'violated': True,
                'message': f'Exceeded 70-hour limit in 8-day period ({total_on_duty_minutes/60:.1f}h)',
                'severity': 'error',
                'rule': '70_hour_cycle'
            }
        elif total_on_duty_minutes > max_minutes - 60:  # Within 1 hour
            return {
                'violated': False,
                'message': f'Approaching 70-hour limit ({(max_minutes - total_on_duty_minutes)/60:.1f}h remaining)',
                'severity': 'warning',
                'rule': '70_hour_cycle'
            }
        
        return None
    
    @staticmethod
    def validate_10_hour_rest(daily_log, previous_daily_log=None):
        """
        Check 10+ consecutive hours off-duty before driving.
        
        Args:
            daily_log: Current DailyLog
            previous_daily_log: Previous day's DailyLog (optional)
            
        Returns:
            dict with violation info if violated, else None
        """
        activities = list(daily_log.activities.all().order_by('sequence', 'start_time'))
        
        # Check if first activity of day is driving
        if activities and activities[0].status == ActivityStatus.DRIVING:
            # Need to check previous day's rest
            if previous_daily_log:
                prev_activities = list(
                    previous_daily_log.activities.all()
                    .order_by('-sequence', '-start_time')
                )
                
                consecutive_rest = 0
                for activity in prev_activities:
                    if activity.status in [ActivityStatus.OFF_DUTY, ActivityStatus.SLEEPER_BERTH]:
                        consecutive_rest += activity.duration_minutes
                    else:
                        break
                
                if consecutive_rest < 10 * 60:
                    return {
                        'violated': True,
                        'message': f'Only {consecutive_rest/60:.1f} hours rest before driving (need 10)',
                        'severity': 'error',
                        'rule': '10_hour_rest'
                    }
            else:
                # No previous log - assume violation
                return {
                    'violated': True,
                    'message': 'No previous rest period recorded before driving',
                    'severity': 'error',
                    'rule': '10_hour_rest'
                }
        
        return None
    
    @staticmethod
    def get_compliance_status(trip, daily_log, current_date=None):
        """
        Get all HOS compliance statuses for a trip/daily_log.
        
        Returns:
            dict with 'violations', 'warnings', 'compliant' boolean
        """
        if current_date is None:
            current_date = timezone.now().date()
        
        violations = []
        warnings = []
        
        # Daily log validations
        result = HOSValidator.validate_11_hour_limit(daily_log)
        if result:
            if result['violated']:
                violations.append(result)
            else:
                warnings.append(result)
        
        result = HOSValidator.validate_14_hour_window(daily_log)
        if result and result['violated']:
            violations.append(result)
        
        result = HOSValidator.validate_30_minute_break(daily_log)
        if result and result['violated']:
            violations.append(result)
        
        # Trip-level validations
        result = HOSValidator.validate_70_hour_cycle(trip, current_date)
        if result:
            if result['violated']:
                violations.append(result)
            else:
                warnings.append(result)
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations,
            'warnings': warnings
        }

