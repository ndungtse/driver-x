from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models


class DriverRole(models.TextChoices):
    DRIVER = 'driver', 'Driver'
    ADMIN = 'admin', 'Admin'


class Driver(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='driver')
    role = models.CharField(max_length=16, choices=DriverRole.choices, default=DriverRole.DRIVER)
    license_number = models.CharField(max_length=64, blank=True)
    cdl_number = models.CharField(max_length=64, blank=True)
    home_terminal = models.CharField(max_length=128, blank=True)
    carrier_name = models.CharField(max_length=128, blank=True)
    carrier_address = models.CharField(max_length=256, blank=True)
    signature = models.TextField(blank=True)  # could store base64 or path to signature image
    phone_number = models.CharField(max_length=32, blank=True)

    def __str__(self) -> str:
        return f"{self.user.username} ({self.role})"


class TripStatus(models.TextChoices):
    PLANNING = 'planning', 'Planning'
    IN_PROGRESS = 'in_progress', 'In Progress'
    COMPLETED = 'completed', 'Completed'


class Trip(models.Model):
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE, related_name='trips')
    status = models.CharField(max_length=32, choices=TripStatus.choices, default=TripStatus.PLANNING)

    # Inputs
    current_location = models.JSONField(default=dict)
    pickup_location = models.JSONField(default=dict)
    dropoff_location = models.JSONField(default=dict)
    current_cycle_hours = models.FloatField(default=0.0)

    # Calculated
    total_distance = models.FloatField(default=0.0)  # miles
    estimated_duration = models.FloatField(default=0.0)  # hours
    start_datetime = models.DateTimeField(null=True, blank=True)
    end_datetime = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Trip {self.id} - {self.driver.user.username} ({self.status})"


class DailyLog(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='daily_logs')
    date = models.DateField()

    # Header metadata
    driver_name = models.CharField(max_length=128, blank=True)
    driver_signature = models.TextField(blank=True)
    co_driver_name = models.CharField(max_length=128, blank=True)
    home_terminal = models.CharField(max_length=128, blank=True)
    carrier_name = models.CharField(max_length=128, blank=True)

    # Vehicle info
    tractor_number = models.CharField(max_length=64, blank=True)
    trailer_numbers = models.JSONField(default=list)

    # Shipping info
    shipper = models.CharField(max_length=128, blank=True)
    commodity = models.CharField(max_length=128, blank=True)
    shipping_doc_numbers = models.JSONField(default=list)

    # Totals
    total_miles_driven = models.FloatField(default=0.0)
    total_truck_mileage = models.FloatField(default=0.0)
    off_duty_hours = models.FloatField(default=0.0)
    sleeper_berth_hours = models.FloatField(default=0.0)
    driving_hours = models.FloatField(default=0.0)
    on_duty_not_driving_hours = models.FloatField(default=0.0)

    class Meta:
        unique_together = ('trip', 'date')

    def __str__(self) -> str:
        return f"DailyLog {self.date} (Trip {self.trip_id})"


class ActivityStatus(models.TextChoices):
    OFF_DUTY = 'off_duty', 'Off Duty'
    SLEEPER_BERTH = 'sleeper_berth', 'Sleeper Berth'
    DRIVING = 'driving', 'Driving'
    ON_DUTY_NOT_DRIVING = 'on_duty_not_driving', 'On Duty Not Driving'


class Activity(models.Model):
    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='activities')
    status = models.CharField(max_length=32, choices=ActivityStatus.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=0)
    location = models.JSONField(default=dict)  # Start location
    end_location = models.JSONField(default=dict, blank=True)  # End location for map plotting
    remark = models.CharField(max_length=256, blank=True)
    miles_driven = models.FloatField(null=True, blank=True)
    sequence = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sequence', 'start_time']

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError('end_time must be after start_time')

    def __str__(self) -> str:
        return f"{self.status} {self.start_time}-{self.end_time} (Log {self.daily_log_id})"


class Route(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='route')
    waypoints = models.JSONField(default=list)
    total_distance = models.FloatField(default=0.0)
    estimated_time = models.FloatField(default=0.0)

    def __str__(self) -> str:
        return f"Route for Trip {self.trip_id}"


class RequiredStopType(models.TextChoices):
    FUEL = 'fuel', 'Fuel'
    BREAK_30 = '30min_break', '30 Minute Break'
    REST_10HR = '10hr_rest', '10 Hour Rest'
    PICKUP = 'pickup', 'Pickup'
    DROPOFF = 'dropoff', 'Dropoff'


class RequiredStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    type = models.CharField(max_length=32, choices=RequiredStopType.choices)
    location = models.JSONField(default=dict)
    duration_minutes = models.PositiveIntegerField(default=0)
    miles_from_start = models.FloatField(default=0.0)
    reason = models.CharField(max_length=256, blank=True)

    def __str__(self) -> str:
        return f"{self.type} at {self.miles_from_start} mi (Route {self.route_id})"


