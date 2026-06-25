from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # This handles password_hash securely
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')  
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # Django's AbstractBaseUser already provides: id, password (password_hash), and last_login (last_login_at)
    class Roles(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        ADMIN = 'admin', 'Admin'
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_picture = models.ImageField(
        upload_to='profiles/',
        blank=True,
        null=True
    )
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, choices=Roles.choices, default=Roles.CUSTOMER)
    
    # Required for Django Admin/Auth management
    is_staff = models.BooleanField(default=False) 

    objects = UserManager()

    USERNAME_FIELD = 'email'  # Logs in using email instead of a username
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

    # Helper properties to easily check role types in views/templates
    @property
    def is_admin(self):
        return self.role == self.Roles.ADMIN

    @property
    def is_customer(self):
        return self.role == self.Roles.CUSTOMER

    # Auto-sync is_staff flag with your custom role when saving to DB
    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
        else:
            self.is_staff = False
        super().save(*args, **kwargs)


class CustomerProfile(models.Model):
    # One-to-one relationship with the Custom User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', db_column='user_id')
    register_type = models.CharField(max_length=50, blank=True, null=True) # e.g., 'email', 'google'
    google_id = models.CharField(max_length=255, blank=True, null=True)
    google_avatar = models.URLField(max_length=500, blank=True, null=True)

    class Meta:
        db_table = 'customers_profiles'

    def __str__(self):
        return f"Profile for {self.user.email}"

class CustomerAddress(models.Model):
    # Foreign key link back to your custom User model. 
    # Use 'unique=False' (default) because a customer can have multiple addresses (Home, Work, etc.)
    customer = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name='addresses', 
        db_column='customer_id'
    )
    recipient_name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    commune = models.CharField(max_length=100)

    class Meta:
        db_table = 'customer_address'
        verbose_name = 'Customer Address'
        verbose_name_plural = 'Customer Addresses'

    def __str__(self):
        return f"{self.recipient_name} - {self.city}, {self.district}"


class OTP(models.Model):
    class Purpose(models.TextChoices):
        EMAIL_VERIFICATION = 'email_verification', 'Email Verification'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        LOGIN = 'login', 'Login'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='otps',
        db_column='user_id'
    )
    code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=50, choices=Purpose.choices)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'otps'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'purpose', 'code']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return not self.is_used and not self.is_expired

    def mark_as_used(self):
        self.is_used = True
        self.used_at = timezone.now()
        self.save(update_fields=['is_used', 'used_at'])
