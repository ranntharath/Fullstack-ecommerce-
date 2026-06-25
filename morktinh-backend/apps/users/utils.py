from django.conf import settings
from django.core.mail import send_mail


def send_otp_email(recipient_email, code):
    return send_mail(
        subject='Your OTP Code From Mork Tinh',
        message=f'Your OTP code is {code}. It will expire in 2 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient_email],
        fail_silently=False,
    )
