from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import (
    Driver,
    Trip,
    DailyLog,
    Activity,
    Route,
    RequiredStop,
    ActivityStatus,
    TripStatus,
    DriverRole,
)


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Driver
        fields = [
            'id', 'role', 'license_number', 'cdl_number', 'home_terminal',
            'carrier_name', 'carrier_address', 'signature', 'phone_number', 'user'
        ]


class UserWithDriverSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    driver = DriverSerializer(read_only=True)


class AuthTokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserWithDriverSerializer()


class RegisterSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    # Driver fields
    role = serializers.ChoiceField(choices=DriverRole.choices, default=DriverRole.DRIVER)
    license_number = serializers.CharField(required=False, allow_blank=True)
    cdl_number = serializers.CharField(required=False, allow_blank=True)
    home_terminal = serializers.CharField(required=False, allow_blank=True)
    carrier_name = serializers.CharField(required=False, allow_blank=True)
    carrier_address = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        driver_fields = {
            'role': validated_data.pop('role', DriverRole.DRIVER),
            'license_number': validated_data.pop('license_number', ''),
            'cdl_number': validated_data.pop('cdl_number', ''),
            'home_terminal': validated_data.pop('home_terminal', ''),
            'carrier_name': validated_data.pop('carrier_name', ''),
            'carrier_address': validated_data.pop('carrier_address', ''),
            'phone_number': validated_data.pop('phone_number', ''),
        }

        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        Driver.objects.create(user=user, **driver_fields)
        return user


class LoginRequestSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class ProfileResponseSerializer(serializers.Serializer):
    user = UserWithDriverSerializer()


class HelloResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    status = serializers.CharField()
    version = serializers.CharField()


class HealthResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'status', 'start_time', 'end_time', 'duration_minutes', 'location',
            'remark', 'miles_driven', 'sequence'
        ]


class DailyLogSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True)

    class Meta:
        model = DailyLog
        fields = [
            'id', 'trip', 'date', 'driver_name', 'driver_signature', 'co_driver_name',
            'home_terminal', 'carrier_name', 'tractor_number', 'trailer_numbers',
            'shipper', 'commodity', 'shipping_doc_numbers', 'total_miles_driven',
            'total_truck_mileage', 'off_duty_hours', 'sleeper_berth_hours',
            'driving_hours', 'on_duty_not_driving_hours', 'activities'
        ]


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'status', 'current_location', 'pickup_location',
            'dropoff_location', 'current_cycle_hours', 'total_distance',
            'estimated_duration', 'start_datetime', 'end_datetime',
            'created_at', 'updated_at'
        ]


class RequiredStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredStop
        fields = ['id', 'type', 'location', 'duration_minutes', 'miles_from_start', 'reason']


class RouteSerializer(serializers.ModelSerializer):
    stops = RequiredStopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'trip', 'waypoints', 'total_distance', 'estimated_time', 'stops']


