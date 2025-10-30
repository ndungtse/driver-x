from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

from .serializers import (
    RegisterSerializer,
    UserSerializer,
    DriverSerializer,
    AuthTokenResponseSerializer,
    UserWithDriverSerializer,
    LoginRequestSerializer,
    ProfileResponseSerializer,
    HelloResponseSerializer,
    HealthResponseSerializer,
)


@extend_schema(responses=HelloResponseSerializer)
@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': 'Hello World!',
        'status': 'API is running',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)


@extend_schema(responses=HealthResponseSerializer)
@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'driver-tracker-api'
    }, status=status.HTTP_200_OK)


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
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {**user_data, 'driver': driver_data}
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    refresh = RefreshToken.for_user(user)
    user_data = UserSerializer(user).data
    driver = getattr(user, 'driver', None)
    driver_data = DriverSerializer(driver).data if driver else None
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {**user_data, 'driver': driver_data}
    })


@extend_schema(responses=ProfileResponseSerializer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auth_profile(request):
    user_data = UserSerializer(request.user).data
    driver = getattr(request.user, 'driver', None)
    driver_data = DriverSerializer(driver).data if driver else None
    return Response({'user': {**user_data, 'driver': driver_data}})

