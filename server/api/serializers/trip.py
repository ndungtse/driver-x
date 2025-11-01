from rest_framework import serializers
from ..models import Trip, Route, RequiredStop


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'status', 'name', 'current_location', 'pickup_location',
            'dropoff_location', 'current_cycle_hours', 'total_distance',
            'estimated_duration', 'start_datetime', 'end_datetime',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['driver', 'created_at', 'updated_at']


class TripDetailSerializer(serializers.ModelSerializer):
    daily_logs_count = serializers.IntegerField(read_only=True, source='daily_logs.count')
    
    class Meta:
        model = Trip
        fields = [
            'id', 'driver', 'status', 'name', 'current_location', 'pickup_location',
            'dropoff_location', 'current_cycle_hours', 'total_distance',
            'estimated_duration', 'start_datetime', 'end_datetime',
            'created_at', 'updated_at', 'daily_logs_count'
        ]
        read_only_fields = ['driver', 'created_at', 'updated_at']


class TripCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            'name', 'current_location', 'pickup_location', 'dropoff_location',
            'current_cycle_hours'
        ]


class TripUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            'name', 'current_location', 'pickup_location', 'dropoff_location',
            'current_cycle_hours'
        ]


class RequiredStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredStop
        fields = ['id', 'type', 'location', 'duration_minutes', 'miles_from_start', 'reason']
        read_only_fields = ['id']


class RouteSerializer(serializers.ModelSerializer):
    stops = RequiredStopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ['id', 'trip', 'waypoints', 'total_distance', 'estimated_time', 'stops']
        read_only_fields = ['id', 'trip']

