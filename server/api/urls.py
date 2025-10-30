from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('hello/', views.hello_world, name='hello_world'),
    path('health/', views.health_check, name='health_check'),
    # Auth
    path('auth/register/', views.auth_register, name='auth_register'),
    path('auth/login/', views.auth_login, name='auth_login'),
    path('auth/profile/', views.auth_profile, name='auth_profile'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

