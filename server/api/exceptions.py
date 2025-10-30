from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON format
    """
    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    # Handle Django IntegrityError specifically
    if isinstance(exc, IntegrityError):
        return Response({
            'success': False,
            'message': 'Database integrity error',
            'data': None,
            'error': {
                'type': 'IntegrityError',
                'detail': str(exc)
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    # If DRF handled it, format the response
    if response is not None:
        error_data = response.data
        
        # Format validation errors nicely
        if isinstance(error_data, dict):
            if 'detail' in error_data:
                error_message = error_data['detail']
                error_detail = error_data
            else:
                error_message = 'Validation error'
                error_detail = error_data
        elif isinstance(error_data, list):
            error_message = str(error_data[0]) if error_data else 'Error occurred'
            error_detail = error_data
        else:
            error_message = str(error_data)
            error_detail = {'detail': error_data}

        return Response({
            'success': False,
            'message': error_message,
            'data': None,
            'error': error_detail
        }, status=response.status_code)

    # If DRF didn't handle it, return generic error
    return Response({
        'success': False,
        'message': 'Internal server error',
        'data': None,
        'error': {
            'type': exc.__class__.__name__,
            'detail': str(exc)
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

