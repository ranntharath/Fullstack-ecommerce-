from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.users.models import User
from .models import Brand, Category, Order, Product, StoreSettings


class AdminOrderViewSetTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='test-password',
            role=User.Roles.ADMIN,
        )
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='test-password',
        )
        self.order = Order.objects.create(
            customer=self.customer,
            recipient_name='Test Customer',
            address_line1='123 Test Street',
            phone='012345678',
            city='Phnom Penh',
            district='Chamkar Mon',
            commune='BKK1',
            total='25.00',
        )

    def test_admin_can_list_and_update_orders(self):
        self.client.force_authenticate(self.admin)

        list_response = self.client.get(reverse('admin-order-list'))
        update_response = self.client.patch(
            reverse('admin-order-detail', args=[self.order.id]),
            {'status': Order.Status.CONFIRMED},
            format='json',
        )

        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(list_response.data['count'], 1)
        self.assertEqual(len(list_response.data['results']), 1)
        self.assertEqual(list_response.data['summary']['orders'], 1)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.data['status'], Order.Status.CONFIRMED)

    def test_customer_cannot_access_admin_orders(self):
        self.client.force_authenticate(self.customer)
        response = self.client.get(reverse('admin-order-list'))
        self.assertEqual(response.status_code, 403)

    def test_order_list_supports_pagination_and_payment_filter(self):
        Order.objects.create(
            customer=self.customer,
            recipient_name='Second Customer',
            address_line1='456 Test Street',
            phone='098765432',
            city='Phnom Penh',
            district='Daun Penh',
            commune='Srah Chak',
            payment_method=Order.PaymentMethod.KHQR,
            total='30.00',
        )
        self.client.force_authenticate(self.admin)

        page_response = self.client.get(
            reverse('admin-order-list'),
            {'page': 1, 'page_size': 1},
        )
        filter_response = self.client.get(
            reverse('admin-order-list'),
            {'payment_method': Order.PaymentMethod.KHQR},
        )

        self.assertEqual(page_response.data['count'], 2)
        self.assertEqual(len(page_response.data['results']), 1)
        self.assertEqual(filter_response.data['count'], 1)
        self.assertEqual(
            filter_response.data['results'][0]['payment_method'],
            Order.PaymentMethod.KHQR,
        )

    def test_admin_can_create_walk_in_order(self):
        category = Category.objects.create(name='Drinks')
        brand = Brand.objects.create(name='Store')
        product = Product.objects.create(
            category=category,
            brand=brand,
            name='Iced coffee',
            base_price='3.50',
        )
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            reverse('admin-order-list'),
            {
                'customer': None,
                'recipient_name': 'Walk In Guest',
                'address_line1': 'Counter sale',
                'phone': '012345678',
                'city': 'Phnom Penh',
                'district': 'Chamkar Mon',
                'commune': 'BKK1',
                'payment_method': Order.PaymentMethod.CASH_ON_DELIVERY,
                'shipping_fee': '1.00',
                'items': [
                    {'product': product.id, 'variant': None, 'quantity': 2},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.data['customer'])
        self.assertEqual(response.data['customer_name'], 'Walk In Guest')
        self.assertEqual(response.data['subtotal'], '7.00')
        self.assertEqual(response.data['total'], '8.00')
        self.assertEqual(response.data['items'][0]['quantity'], 2)

    def test_admin_can_create_order_for_registered_customer(self):
        category = Category.objects.create(name='Accessories')
        brand = Brand.objects.create(name='Shop')
        product = Product.objects.create(
            category=category,
            brand=brand,
            name='Keychain',
            base_price='2.00',
        )
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            reverse('admin-order-list'),
            {
                'customer': self.customer.id,
                'recipient_name': 'Test Customer',
                'address_line1': '123 Test Street',
                'phone': '012345678',
                'city': 'Phnom Penh',
                'district': 'Chamkar Mon',
                'commune': 'BKK1',
                'items': [{'product': product.id, 'quantity': 1}],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['customer'], self.customer.id)
        self.assertEqual(response.data['customer_email'], self.customer.email)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_admin_created_order_sends_alert_email(self):
        settings = StoreSettings.load()
        settings.alert_email = 'alerts@morktinh.com'
        settings.email_alerts_enabled = True
        settings.order_alerts_enabled = True
        settings.save()
        category = Category.objects.create(name='Alert Category')
        brand = Brand.objects.create(name='Alert Brand')
        product = Product.objects.create(
            category=category,
            brand=brand,
            name='Alert Product',
            base_price='5.00',
        )
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            reverse('admin-order-list'),
            {
                'customer': self.customer.id,
                'recipient_name': 'Test Customer',
                'address_line1': '123 Test Street',
                'phone': '012345678',
                'city': 'Phnom Penh',
                'district': 'Chamkar Mon',
                'commune': 'BKK1',
                'items': [{'product': product.id, 'quantity': 1}],
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['alerts@morktinh.com'])
        self.assertIn(f"New order #{response.data['id']}", mail.outbox[0].subject)
