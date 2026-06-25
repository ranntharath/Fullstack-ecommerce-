import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import User


class LoginViewTests(APITestCase):
    def test_login_serializes_profile_picture_as_url(self):
        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                user = User.objects.create_user(
                    email='avatar@example.com',
                    password='correct-password',
                    is_email_verified=True,
                    profile_picture=SimpleUploadedFile(
                        'avatar.jpg',
                        b'\xff\xd8\xff\xe0fake-jpeg-data',
                        content_type='image/jpeg',
                    ),
                )

                response = self.client.post(
                    reverse('login'),
                    {
                        'email': user.email,
                        'password': 'correct-password',
                    },
                    format='json',
                )

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data['user']['profile_picture'], str)
        self.assertTrue(
            response.data['user']['profile_picture'].endswith('/profiles/avatar.jpg')
        )


class CustomerManagementViewSetTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='admin-password',
        )
        self.customer = User.objects.create_user(
            email='customer@example.com',
            password='customer-password',
            first_name='Existing',
            is_email_verified=True,
        )
        self.client.force_authenticate(self.admin)

    def test_admin_can_search_customers(self):
        response = self.client.get(
            reverse('customer-management-list'),
            {'search': 'Existing'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.customer.id)

    def test_admin_can_filter_customers_by_active_status(self):
        inactive_customer = User.objects.create_user(
            email='inactive@example.com',
            password='customer-password',
            is_active=False,
        )

        response = self.client.get(
            reverse('customer-management-list'),
            {'is_active': 'false'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], inactive_customer.id)

    def test_admin_can_filter_customers_by_email_verification(self):
        unverified_customer = User.objects.create_user(
            email='unverified@example.com',
            password='customer-password',
            is_email_verified=False,
        )

        response = self.client.get(
            reverse('customer-management-list'),
            {'is_email_verified': 'false'},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], unverified_customer.id)

    def test_customer_management_cannot_create_admin(self):
        response = self.client.post(
            reverse('customer-management-list'),
            {
                'email': 'new@example.com',
                'password': 'new-password',
                'password_confirm': 'new-password',
                'role': User.Roles.ADMIN,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['role'], User.Roles.CUSTOMER)
        self.assertEqual(
            User.objects.get(email='new@example.com').role,
            User.Roles.CUSTOMER,
        )
