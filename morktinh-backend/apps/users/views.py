from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import filters, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.throttling import AnonRateThrottle
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework.pagination import PageNumberPagination
from .models import CustomerAddress
from .serializers import (
    RegisterSerializer,
    SendOtpserializer,
    VerifyOTPSerializer,
    ResetPasswordSerializer,
    LoginSerializer,
    CustomerManagementSerializer,
    CustomerAddressSerializer,
    UserProfileSerializer,
)
from .permissions import IsAdmin

User = get_user_model()


class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RegisterView(APIView):
    """
    Handles initial user registration.
    """
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Registration successful. Please verify your email."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendOTPView(APIView):
    """
    Handles sending and resending OTPs. 
    Includes a 1-request-per-minute limit to prevent spam/abuse.
    """
    # Simple throttle check: maximum 1 request per minute per unauthenticated IP
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = SendOtpserializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Triggers your create() method & sends email
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """
    Verifies the provided OTP code.
    If valid, automatically flips the user's 'is_email_verified' status to True.
    """
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            otp_instance = serializer.save()  # Marks OTP as used
            
            #  Update the user's verification status automatically on success
            user = otp_instance.user
            if otp_instance.purpose == 'email_verification' and not user.is_email_verified:
                user.is_email_verified = True
                user.save()
                
            message = "Reset code verified successfully." if otp_instance.purpose == 'password_reset' else "Email verified successfully! You can now log in."
            return Response({"message": message}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    """
    Sets a new password after a password-reset OTP has been verified.
    """
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password reset successful. You can now log in."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Authenticates valid users and returns an API Token.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user_data = UserProfileSerializer(
                user,
                context={'request': request},
            ).data
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "Login successful.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_data,
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerManagementViewSet(viewsets.ModelViewSet):
    """
    View for administrators to create and manage customer/user records.
    """
    serializer_class = CustomerManagementSerializer
    permission_classes = [IsAdmin]
    pagination_class = StandardResultsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering_fields = ['id', 'email', 'first_name', 'last_name', 'last_login']
    ordering = ['-id']

    def get_queryset(self):
        queryset = User.objects.filter(role=User.Roles.CUSTOMER)

        is_active = self.request.query_params.get('is_active')
        if is_active in {'true', 'false'}:
            queryset = queryset.filter(is_active=is_active == 'true')

        is_email_verified = self.request.query_params.get('is_email_verified')
        if is_email_verified in {'true', 'false'}:
            queryset = queryset.filter(
                is_email_verified=is_email_verified == 'true'
            )

        return queryset


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerAddressViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerAddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(
            customer=self.request.user
        ).order_by('id')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)
