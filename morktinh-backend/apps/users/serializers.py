
from rest_framework import   serializers
from django.contrib.auth import get_user_model, authenticate
from .models import CustomerAddress, CustomerProfile,OTP
from .utils import send_otp_email
import random
from django.utils import timezone
User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    class Meta:
        model = User
        fields = [ 'id', 'email', 'first_name', 'last_name', 'phone', 'password', 'password_confirm', ] 
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError("Passwords do not match.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')  # Remove password_confirm before creating user
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        CustomerProfile.objects.create(user=user,register_type='email')
        return user

class SendOtpserializer(serializers.Serializer):
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(
    choices=OTP.Purpose.choices
    )

    def validate_email(self,value):
        try:
            self.user = User.objects.get(email=value)
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('User with this email does not exist') from exc
        purpose = self.initial_data.get('purpose')
        if purpose == OTP.Purpose.EMAIL_VERIFICATION and self.user.is_email_verified:
            raise serializers.ValidationError('Email is already verified.')
        return value

    def create(self,validated_data):
        code = f"{random.randint(0,999999):06d}"
        otp = OTP.objects.create(
            user= self.user,
            code=code,
            purpose = validated_data['purpose'],
            expires_at=timezone.now() + timezone.timedelta(minutes=2)
        )
        try:
            send_otp_email(self.user.email, code)

        except Exception as exc:
            otp.delete()  # Clean up OTP if email sending fails
            raise serializers.ValidationError('Failed to send OTP email. Please try again later.') from exc 
        self.instance = otp
        return self.instance
    
    def to_representation(self, instance):
        return { 
            'message': 'OTP sent successfully.', 
            'expires_at': instance.expires_at, 
        }


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    purpose = serializers.ChoiceField(
    choices=OTP.Purpose.choices
    )

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('User with this email does not exist') from exc
        
        otp_qs = OTP.objects.filter(
            user=user,
            code=data['code'],
            purpose=data['purpose'],
            is_used=False,
            expires_at__gt=timezone.now()
        )
        if not otp_qs.exists():
            raise serializers.ValidationError('Invalid or expired OTP code.')
        
        self.otp = otp_qs.first()
        return data

    def save(self):
        self.otp.is_used = True
        self.otp.used_at = timezone.now()
        self.otp.save()
        return self.otp


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(min_length=8, write_only=True)

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password': 'Passwords do not match.'})

        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist as exc:
            raise serializers.ValidationError('User with this email does not exist') from exc

        otp_qs = OTP.objects.filter(
            user=user,
            code=data['code'],
            purpose=OTP.Purpose.PASSWORD_RESET,
            is_used=True,
            used_at__gt=timezone.now() - timezone.timedelta(minutes=10)
        )
        if not otp_qs.exists():
            raise serializers.ValidationError('Please verify your reset code before changing password.')

        self.user = user
        self.otp = otp_qs.first()
        return data

    def save(self):
        self.user.set_password(self.validated_data['password'])
        self.user.save(update_fields=['password'])
        self.otp.delete()
        return self.user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        # 1. Fetch the user by email first to check custom flags
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password.')

        # 2. Check password validity
        if not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')

        # 3. Check custom business logic flags
        if not user.is_email_verified:
            raise serializers.ValidationError('Please verify your email address before logging in.')

        if not user.is_active:
            raise serializers.ValidationError('This account is inactive.')

        # Attach the user object to the validated data for the view to use
        data['user'] = user
        return data


class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = [
            'register_type',
            'google_id',
            'google_avatar',
        ]
        read_only_fields = fields


class UserProfileSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'profile_picture',
            'is_email_verified',
            'role',
            'profile',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_email_verified',
            'role',
            'profile',
        ]


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = [
            'id',
            'recipient_name',
            'address_line1',
            'address_line2',
            'phone',
            'city',
            'district',
            'commune',
        ]
        read_only_fields = ['id']


class CustomerManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(min_length=8, write_only=True, required=False)
    password_confirm = serializers.CharField(min_length=8, write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 
            'phone', 'password', 'password_confirm', 'role',
            'is_active', 'is_email_verified', 'last_login',
        ] 
        read_only_fields = ['id', 'role', 'last_login']

    def validate(self, data):
       
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        if self.instance is None and not password:
            raise serializers.ValidationError({"password": "This field is required."})
        
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({"password": "Passwords do not match."})
                
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            role=User.Roles.CUSTOMER,
            **validated_data,
        )
        return user

    def update(self, instance, validated_data):
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
