from rest_framework import serializers
from ..models import DailyLog, Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id', 'status', 'start_time', 'end_time', 'duration_minutes', 'location',
            'end_location', 'remark', 'miles_driven', 'sequence'
        ]
        read_only_fields = ['id', 'duration_minutes', 'sequence']


class ActivityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'status', 'start_time', 'end_time', 'location', 'end_location', 'remark', 'miles_driven'
        ]
    
    def validate(self, attrs):
        """Calculate miles_driven if end_location is provided and miles_driven is not set"""
        # Check if end_location has actual data (not empty dict)
        end_location = attrs.get('end_location')
        location = attrs.get('location')
        
        has_end_location = end_location and (
            end_location.get('latitude') or end_location.get('address')
        )
        has_location = location and (
            location.get('latitude') or location.get('address')
        )
        
        if not attrs.get('miles_driven') and has_end_location and has_location:
            from ..services.distance_calculator import DistanceCalculator
            distance = DistanceCalculator.calculate_distance(location, end_location)
            if distance is not None:
                attrs['miles_driven'] = distance
        return attrs


class ActivityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'status', 'start_time', 'end_time', 'location', 'end_location', 'remark', 'miles_driven'
        ]
    
    def validate(self, attrs):
        """Calculate miles_driven if end_location is provided and miles_driven is not set"""
        # If miles_driven is not provided in update, calculate it if end_location exists
        if 'miles_driven' not in attrs or attrs.get('miles_driven') is None:
            # Get end_location from attrs or existing instance
            end_location = attrs.get('end_location')
            location = attrs.get('location')
            
            if not end_location and self.instance:
                end_location = self.instance.end_location or {}
            
            if not location and self.instance:
                location = self.instance.location or {}
            
            # Check if locations have actual data (not empty dicts)
            has_end_location = end_location and (
                end_location.get('latitude') or end_location.get('address')
            )
            has_location = location and (
                location.get('latitude') or location.get('address')
            )
            
            if has_end_location and has_location:
                from ..services.distance_calculator import DistanceCalculator
                distance = DistanceCalculator.calculate_distance(location, end_location)
                if distance is not None:
                    attrs['miles_driven'] = distance
        return attrs


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

