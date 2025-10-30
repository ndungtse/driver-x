from rest_framework.response import Response
from rest_framework import status


def api_response(success=True, message='', data=None, error=None, status_code=status.HTTP_200_OK):
    """
    Standardized API response format
    
    Args:
        success: Boolean indicating success/failure
        message: Human-readable message
        data: Response data (any JSON-serializable object)
        error: Error details (if any)
        status_code: HTTP status code
    """
    response_data = {
        'success': success,
        'message': message,
        'data': data,
        'error': error
    }
    return Response(response_data, status=status_code)


def success_response(message='Success', data=None, status_code=status.HTTP_200_OK):
    """Helper for success responses"""
    return api_response(success=True, message=message, data=data, status_code=status_code)


def error_response(message='Error', error=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Helper for error responses"""
    return api_response(success=False, message=message, error=error, status_code=status_code)

