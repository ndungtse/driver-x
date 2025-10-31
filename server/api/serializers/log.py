from rest_framework import serializers
from ..models import DailyLog, Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'status', 'start_time', 'end_time', 'duration_minutes', 'location',
            'remark', 'miles_driven', 'sequence'
        ]
        read_only_fields = ['id', 'duration_minutes', 'sequence']


class ActivityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'status', 'start_time', 'end_time', 'location', 'remark', 'miles_driven'
        ]


class ActivityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'status', 'start_time', 'end_time', 'location', 'remark', 'miles_driven'
        ]


class DailyLogSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = DailyLog
        fields = [
            'id', 'trip', 'date', 'driver_name', 'driver_signature', 'co_driver_name',
            'home_terminal', 'carrier_name', 'tractor_number', 'trailer_numbers',
            'shipper', 'commodity', 'shipping_doc_numbers', 'total_miles_driven',
            'total_truck_mileage', 'off_duty_hours', 'sleeper_berth_hours',
            'driving_hours', 'on_duty_not_driving_hours', 'activities'
        ]
        read_only_fields = [
            'id', 'total_miles_driven', 'total_truck_mileage', 'off_duty_hours',
            'sleeper_berth_hours', 'driving_hours', 'on_duty_not_driving_hours'
        ]


class DailyLogSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = [
            'id', 'date', 'total_miles_driven', 'driving_hours',
            'off_duty_hours', 'sleeper_berth_hours', 'on_duty_not_driving_hours'
        ]
        read_only_fields = ['id']


class DailyLogCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = [
            'date', 'co_driver_name', 'tractor_number', 'trailer_numbers',
            'shipper', 'commodity', 'shipping_doc_numbers'
        ]


class DailyLogUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyLog
        fields = [
            'co_driver_name', 'tractor_number', 'trailer_numbers',
            'shipper', 'commodity', 'shipping_doc_numbers', 'driver_signature'
        ]

