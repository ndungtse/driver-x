from django.urls import path, include
from rest_framework_nested import routers
from rest_framework_simplejwt.views import TokenRefreshView

from .views import trip, daily_log, activity, auth, common

# Main router
router = routers.DefaultRouter()
router.register(r'trips', trip.TripViewSet, basename='trip')
router.register(r'daily-logs', daily_log.DailyLogViewSet, basename='daily-log')
router.register(r'activities', activity.ActivityViewSet, basename='activity')

# Nested: /trips/{trip_pk}/daily-logs/
trips_router = routers.NestedDefaultRouter(router, r'trips', lookup='trip')
trips_router.register(r'daily-logs', daily_log.DailyLogViewSet, basename='trip-daily-logs')

# Nested: /daily-logs/{daily_log_pk}/activities/
logs_router = routers.NestedDefaultRouter(router, r'daily-logs', lookup='daily_log')
logs_router.register(r'activities', activity.ActivityViewSet, basename='daily-log-activities')

urlpatterns = [
    # Auth routes (function-based)
    path('auth/register/', auth.auth_register, name='auth_register'),
    path('auth/login/', auth.auth_login, name='auth_login'),
    path('auth/profile/', auth.auth_profile, name='auth_profile'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # REST API routes
    path('', include(router.urls)),
    path('', include(trips_router.urls)),  # /trips/{trip_pk}/daily-logs/
    path('', include(logs_router.urls)),  # /daily-logs/{daily_log_pk}/activities/

    # Utility endpoints
    path('hello/', common.hello_world, name='hello_world'),
    path('health/', common.health_check, name='health_check'),
]
