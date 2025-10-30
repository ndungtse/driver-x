from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def hello_world(request):
    return Response({
        'message': 'Hello World!',
        'status': 'API is running',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'driver-tracker-api'
    }, status=status.HTTP_200_OK)

