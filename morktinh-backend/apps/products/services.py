import uuid

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from bakong_khqr import KHQR

from .models import Order, PaymentTransaction, StoreSettings


PAID_STATUS = 'PAID'
UNPAID_STATUS = 'UNPAID'
NOT_FOUND_STATUS = 'NOT_FOUND'
def normalize_payment_status(status):
    if isinstance(status, tuple):
        status = status[0] if status else None

    if isinstance(status, dict):
        status = (
            status.get('status')
            or status.get('payment_status')
            or status.get('data', {}).get('status')
        )

    if isinstance(status, bool):
        return PAID_STATUS if status else UNPAID_STATUS

    normalized_status = str(status or '').strip().upper()

    if normalized_status == PaymentTransaction.Status.PAID.upper():
        return PAID_STATUS

    if normalized_status == PaymentTransaction.Status.PENDING.upper():
        return UNPAID_STATUS

    return normalized_status or UNPAID_STATUS


def build_khqr_image_data_url(qr_payload):
    return KHQR(settings.BAKONG_TOKEN).qr_image(
        qr=qr_payload,
        format='base64_uri',
    )


def strip_data_url_prefix(data_url):
    return data_url.split(',', 1)[1] if ',' in data_url else data_url


def format_khqr_image_payload(qr_payload):
    qr_image_data_url = build_khqr_image_data_url(qr_payload)
    return strip_data_url_prefix(qr_image_data_url), qr_image_data_url


def create_khqr_payment(order: Order, refresh=False):
    """
    Creates a KHQR payment for an order.
    Returns (qr_string, md5, qr_image_base64, qr_image_data_url)
    """
    try:
        payment = order.payment
        if payment.status == PaymentTransaction.Status.PAID or (
            not refresh and payment.status == PaymentTransaction.Status.PENDING
        ):
            qr_image_base64, qr_image_data_url = format_khqr_image_payload(payment.khqr_payload)
            return (
                payment.khqr_payload,
                payment.transaction_id,
                qr_image_base64,
                qr_image_data_url,
            )
    except PaymentTransaction.DoesNotExist:
        payment = None

    khqr = KHQR(settings.BAKONG_TOKEN)
    bill_number = uuid.uuid4().hex[:12]

    qr = khqr.create_qr(
        account_id=settings.KHQR_ACCOUNT_ID,
        merchant_name=settings.KHQR_MERCHANT_NAME,
        merchant_city=settings.KHQR_MERCHANT_CITY,
        amount=float(order.total),
        currency='USD',
        store_label=settings.KHQR_STORE_LABEL,
        phone_number=settings.KHQR_PHONE_NUMBER,
        bill_number=bill_number,
        terminal_label=settings.KHQR_TERMINAL_LABEL,
        static=False,
    )

    md5 = khqr.generate_md5(qr=qr)

    with transaction.atomic():
        PaymentTransaction.objects.update_or_create(
            order=order,
            defaults={
                'transaction_id': md5,
                'khqr_payload': qr,
                'amount': order.total,
                'status': PaymentTransaction.Status.PENDING,
                'paid_at': None,
            },
        )

    qr_image_base64, qr_image_data_url = format_khqr_image_payload(qr)
    return qr, md5, qr_image_base64, qr_image_data_url


def check_khqr_payment(order: Order):
    """
    Checks payment status and updates DB if paid.
    Returns status string: 'PAID' or 'UNPAID'
    """
    khqr = KHQR(settings.BAKONG_TOKEN)

    payment = PaymentTransaction.objects.filter(order=order).first()
    if payment is None or not payment.transaction_id:
        return NOT_FOUND_STATUS

    if payment.status == PaymentTransaction.Status.PAID:
        return PAID_STATUS  # already confirmed, skip API call

    payment_status = normalize_payment_status(
        khqr.check_payment(md5=payment.transaction_id)
    )

    if payment_status == PAID_STATUS:
        with transaction.atomic():
            payment = PaymentTransaction.objects.select_for_update().get(pk=payment.pk)
            if payment.status != PaymentTransaction.Status.PAID:
                payment.status = PaymentTransaction.Status.PAID
                payment.paid_at = timezone.now()
                payment.save(update_fields=['status', 'paid_at', 'updated_at'])

            Order.objects.filter(
                pk=order.pk,
                status=Order.Status.PENDING,
            ).update(status=Order.Status.CONFIRMED, updated_at=timezone.now())

    return payment_status


def send_store_alert_email(subject, message, fail_silently=False):
    store_settings = StoreSettings.load()

    if (
        not store_settings.email_alerts_enabled
        or not store_settings.order_alerts_enabled
        or not store_settings.alert_email
    ):
        return 0

    return send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[store_settings.alert_email],
        fail_silently=fail_silently,
    )


def send_new_order_alert_email(order):
    store_settings = StoreSettings.load()
    customer = order.customer.email if order.customer else order.contact_email
    message = (
        f"New order #{order.id} needs review.\n\n"
        f"Customer: {customer or order.recipient_name}\n"
        f"Total: {order.total} {store_settings.currency_code}\n"
        f"Status: {order.status}\n"
        f"Payment method: {order.payment_method}\n"
    )

    return send_store_alert_email(
        subject=f"New order #{order.id} - {store_settings.store_name}",
        message=message,
        fail_silently=False,
    )
