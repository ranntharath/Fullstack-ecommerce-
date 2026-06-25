from decimal import Decimal
from unittest.mock import patch

from django.test import TestCase, override_settings

from .models import PaymentTransaction
from .services import create_khqr_payment, normalize_payment_status


class OrderWithoutPayment:
    id = 42
    total = Decimal('12.50')

    @property
    def payment(self):
        raise PaymentTransaction.DoesNotExist


@override_settings(
    BAKONG_TOKEN='test-token',
    KHQR_ACCOUNT_ID='rann_tharath@bkrt',
    KHQR_MERCHANT_NAME='Rann tharath',
    KHQR_MERCHANT_CITY='Phnom Penh',
    KHQR_STORE_LABEL='IRCT SHOP',
    KHQR_PHONE_NUMBER='060535771',
    KHQR_TERMINAL_LABEL='WebQR',
)
class KHQRServiceTests(TestCase):
    def test_normalizes_tuple_status(self):
        self.assertEqual(normalize_payment_status(('PAID', 0)), 'PAID')
        self.assertEqual(normalize_payment_status(('UNPAID', 5)), 'UNPAID')

    @patch('apps.products.services.PaymentTransaction.objects.update_or_create')
    @patch('apps.products.services.KHQR')
    def test_creates_qr_from_config_and_renders_the_generated_payload(
        self,
        khqr_class,
        update_or_create,
    ):
        khqr = khqr_class.return_value
        khqr.create_qr.return_value = 'generated-qr-payload'
        khqr.generate_md5.return_value = 'generated-md5'
        khqr.qr_image.return_value = 'data:image/png;base64,aW1hZ2U='

        result = create_khqr_payment(OrderWithoutPayment())

        self.assertEqual(result[0], 'generated-qr-payload')
        self.assertEqual(result[1], 'generated-md5')
        self.assertEqual(result[2], 'aW1hZ2U=')
        self.assertEqual(result[3], 'data:image/png;base64,aW1hZ2U=')

        create_kwargs = khqr.create_qr.call_args.kwargs
        self.assertEqual(create_kwargs['account_id'], 'rann_tharath@bkrt')
        self.assertEqual(create_kwargs['merchant_name'], 'Rann tharath')
        self.assertEqual(create_kwargs['amount'], 12.5)
        self.assertEqual(create_kwargs['currency'], 'USD')
        self.assertEqual(len(create_kwargs['bill_number']), 12)
        khqr.generate_md5.assert_called_once_with(qr='generated-qr-payload')
        khqr.qr_image.assert_called_once_with(
            qr='generated-qr-payload',
            format='base64_uri',
        )
        update_or_create.assert_called_once()
