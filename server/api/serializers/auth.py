from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from ..models import Driver, DriverRole

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


class AuthTokenDataSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserWithDriverSerializer()


class AuthTokenResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = AuthTokenDataSerializer()
    error = serializers.JSONField(allow_null=True)


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

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
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


class ProfileDataSerializer(serializers.Serializer):
    user = UserWithDriverSerializer()


class ProfileResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = ProfileDataSerializer()
    error = serializers.JSONField(allow_null=True)

