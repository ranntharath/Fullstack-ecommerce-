from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomerAddressViewSet,
    CustomerManagementViewSet,
    LoginView,
    RegisterView,
    ResetPasswordView,
    SendOTPView,
    UserProfileView,
    VerifyOTPView,
)

router = DefaultRouter()
router.register('management/customers', CustomerManagementViewSet, basename='customer-management')
router.register('profile/addresses', CustomerAddressViewSet, basename='profile-addresses')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/me/', UserProfileView.as_view(), name='profile-me'),
    path('', include(router.urls)),
]
