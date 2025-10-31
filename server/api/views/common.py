from rest_framework.decorators import api_view
from drf_spectacular.utils import extend_schema

from ..serializers import HelloResponseSerializer, HealthResponseSerializer
from ..response import success_response


@extend_schema(responses=HelloResponseSerializer)
@api_view(['GET'])
def hello_world(request):
    return success_response(
        message='API is running',
        data={
            'message': 'Hello World!',
            'version': '1.0.0'
        }
    )


@extend_schema(responses=HealthResponseSerializer)
@api_view(['GET'])
def health_check(request):
    return success_response(
        message='Service is healthy',
        data={
            'status': 'healthy',
            'service': 'driver-tracker-api'
        }
    )

