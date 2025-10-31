from rest_framework import serializers


class HelloDataSerializer(serializers.Serializer):
    message = serializers.CharField()
    version = serializers.CharField()


class HelloResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = HelloDataSerializer()
    error = serializers.JSONField(allow_null=True)


class HealthDataSerializer(serializers.Serializer):
    status = serializers.CharField()
    service = serializers.CharField()


class HealthResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = HealthDataSerializer()
    error = serializers.JSONField(allow_null=True)

