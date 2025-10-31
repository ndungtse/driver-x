from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from ..serializers import (
    RegisterSerializer,
    UserSerializer,
    DriverSerializer,
    AuthTokenResponseSerializer,
    LoginRequestSerializer,
    ProfileResponseSerializer,
)
from ..response import success_response, error_response


@extend_schema(
    request=RegisterSerializer,
    responses={
        201: OpenApiResponse(response=AuthTokenResponseSerializer, description='User created and tokens issued'),
        400: OpenApiResponse(description='Validation error'),
    },
    examples=[
        OpenApiExample(
            'Register example',
            value={
                "username": "driver1",
                "email": "d1@example.com",
                "password": "StrongPass!123",
                "first_name": "D",
                "last_name": "One",
                "role": "driver",
                "home_terminal": "Green Bay, WI",
                "carrier_name": "Schneider"
            },
        )
    ],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def auth_register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data
        driver = getattr(user, 'driver', None)
        driver_data = DriverSerializer(driver).data if driver else None
        return success_response(
            message='User registered successfully',
            data={
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {**user_data, 'driver': driver_data}
            },
            status_code=status.HTTP_201_CREATED
        )
    return error_response(
        message='Registration failed',
        error=serializer.errors,
        status_code=status.HTTP_400_BAD_REQUEST
    )


@extend_schema(
    request=LoginRequestSerializer,
    responses={200: AuthTokenResponseSerializer, 401: OpenApiResponse(description='Invalid credentials')}
)
@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if not user:
        return error_response(
            message='Invalid credentials',
            error={'detail': 'Username or password is incorrect'},
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    driver = getattr(user, 'driver', None)
    driver_data = DriverSerializer(driver).data if driver else None
    return success_response(
        message='Login successful',
        data={
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {**user_data, 'driver': driver_data}
        }
    )


@extend_schema(responses=ProfileResponseSerializer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_profile(request):
    user_data = UserSerializer(request.user).data
    driver = getattr(request.user, 'driver', None)
    driver_data = DriverSerializer(driver).data if driver else None
    return success_response(
        message='Profile retrieved successfully',
        data={'user': {**user_data, 'driver': driver_data}}
    )

