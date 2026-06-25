from decimal import Decimal

from django.core import mail
from django.test import TestCase
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from apps.users.models import User

from .models import Brand, Cart, CartItem, Category, Discount, Order, Product, ProductTag, ProductVariant, StoreSettings
from .serializers import ProductVariantSerializer
from .services import send_new_order_alert_email


class ProductDiscountOverrideTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Phones')
        self.brand = Brand.objects.create(name='Apple')
        self.product = Product.objects.create(
            category=self.category,
            brand=self.brand,
            name='iPhone',
            base_price=Decimal('1000.00'),
        )
        self.starts_at = timezone.now() - timezone.timedelta(days=1)
        self.ends_at = timezone.now() + timezone.timedelta(days=1)

    def create_discount(self, name, value, is_global, override_product_discount=False):
        return Discount.objects.create(
            name=name,
            discount_type='percent',
            value=Decimal(value),
            is_global=is_global,
            override_product_discount=override_product_discount,
            is_active=True,
            start_date=self.starts_at,
            end_date=self.ends_at,
        )

    def test_global_override_discount_wins_over_product_discount(self):
        product_discount = self.create_discount('iPhone Discount', '10.00', False)
        self.product.discounts.add(product_discount)
        self.create_discount('New Year Sale', '20.00', True, True)

        self.assertEqual(self.product.get_active_discount().name, 'New Year Sale')
        self.assertEqual(self.product.final_price, Decimal('800.0000'))

    def test_product_discount_wins_when_global_discount_does_not_override(self):
        product_discount = self.create_discount('iPhone Discount', '10.00', False)
        self.product.discounts.add(product_discount)
        self.create_discount('Summer Sale', '15.00', True, False)

        self.assertEqual(self.product.get_active_discount().name, 'iPhone Discount')
        self.assertEqual(self.product.final_price, Decimal('900.0000'))

    def test_no_discount_is_used_when_product_has_no_discount_and_global_does_not_override(self):
        self.create_discount('Global Sale', '50.00', True, False)

        self.assertIsNone(self.product.get_active_discount())
        self.assertEqual(self.product.final_price, Decimal('1000.00'))


class ProductListPayloadTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        category = Category.objects.create(name='Phones')
        brand = Brand.objects.create(name='Apple')
        self.product = Product.objects.create(
            category=category,
            brand=brand,
            name='iPhone',
            base_price=Decimal('1000.00'),
        )
        ProductVariant.objects.create(
            product=self.product,
            sku='IPHONE-BASE',
            stock=10,
            price=Decimal('1000.00'),
        )

    def test_product_list_excludes_heavy_detail_relations(self):
        response = self.client.get(reverse('product-list'))

        self.assertEqual(response.status_code, 200)
        product = response.data['results'][0]
        self.assertNotIn('variants', product)
        self.assertNotIn('option_groups', product)
        self.assertNotIn('videos', product)
        self.assertNotIn('free_items', product)
        self.assertEqual(product['variants_count'], 1)

    def test_product_detail_includes_full_relations(self):
        response = self.client.get(reverse('product-detail', args=[self.product.id]))

        self.assertEqual(response.status_code, 200)
        self.assertIn('variants', response.data)
        self.assertEqual(len(response.data['variants']), 1)


class ProductVariantSerializerTests(TestCase):
    def setUp(self):
        category = Category.objects.create(name='Variant Phones')
        brand = Brand.objects.create(name='Variant Brand')
        self.product = Product.objects.create(
            category=category,
            brand=brand,
            name='Variant Phone',
            base_price=Decimal('500.00'),
        )

    def test_create_ignores_serializer_only_clear_image_field(self):
        serializer = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'VARIANT-CREATE',
            'stock': 5,
            'price': '500.00',
            'clear_image': False,
            'is_active': True,
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        variant = serializer.save()

        self.assertEqual(variant.sku, 'VARIANT-CREATE')
        self.assertFalse(bool(variant.image))


class AdminStoreSettingsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin-settings@example.com',
            password='admin-password',
        )
        self.client.force_authenticate(self.admin)

    def test_admin_can_update_store_settings(self):
        response = self.client.patch(reverse('admin-settings'), {
            'store_name': 'Morktinh Pro',
            'support_email': 'help@morktinh.com',
            'alert_email': 'alerts@morktinh.com',
            'support_phone': '012345678',
            'currency_code': 'usd',
            'default_shipping_fee': '2.50',
            'low_stock_threshold': 8,
            'email_alerts_enabled': False,
            'order_alerts_enabled': True,
            'compact_dashboard': True,
            'allow_out_of_stock_cart': False,
            'maintenance_mode': True,
            'announcement_text': 'Big sale today',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['store_name'], 'Morktinh Pro')
        self.assertEqual(response.data['alert_email'], 'alerts@morktinh.com')
        self.assertEqual(response.data['currency_code'], 'USD')
        self.assertEqual(response.data['low_stock_threshold'], 8)
        self.assertTrue(response.data['maintenance_mode'])

    def test_dashboard_uses_settings_low_stock_threshold(self):
        category = Category.objects.create(name='Dashboard Phones')
        brand = Brand.objects.create(name='Dashboard Brand')
        product = Product.objects.create(
            category=category,
            brand=brand,
            name='Threshold Phone',
            base_price=Decimal('500.00'),
        )
        ProductVariant.objects.create(
            product=product,
            sku='THRESHOLD-7',
            stock=7,
            price=Decimal('500.00'),
        )
        settings = StoreSettings.load()
        settings.low_stock_threshold = 7
        settings.save(update_fields=['low_stock_threshold'])

        response = self.client.get(reverse('admin-dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['summary']['low_stock_threshold'], 7)
        self.assertEqual(response.data['summary']['low_stock_count'], 1)

    def test_dashboard_exposes_order_alert_setting(self):
        settings = StoreSettings.load()
        settings.order_alerts_enabled = False
        settings.save(update_fields=['order_alerts_enabled'])

        response = self.client.get(reverse('admin-dashboard'))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['summary']['order_alerts_enabled'])

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_new_order_email_alert_respects_settings(self):
        settings = StoreSettings.load()
        settings.support_email = 'support@morktinh.com'
        settings.alert_email = 'ops@morktinh.com'
        settings.email_alerts_enabled = True
        settings.order_alerts_enabled = True
        settings.save()
        order = Order.objects.create(
            customer=self.admin,
            recipient_name='Admin',
            address_line1='Street 1',
            phone='012345678',
            city='Phnom Penh',
            district='Chamkarmon',
            commune='Tonle Bassac',
            contact_email='customer@example.com',
            subtotal=Decimal('10.00'),
            total=Decimal('10.00'),
        )

        sent = send_new_order_alert_email(order)

        self.assertEqual(sent, 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['ops@morktinh.com'])

        settings.order_alerts_enabled = False
        settings.save(update_fields=['order_alerts_enabled'])
        sent = send_new_order_alert_email(order)

        self.assertEqual(sent, 0)
        self.assertEqual(len(mail.outbox), 1)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_admin_can_send_test_alert_email(self):
        settings = StoreSettings.load()
        settings.alert_email = 'alerts@morktinh.com'
        settings.email_alerts_enabled = True
        settings.order_alerts_enabled = True
        settings.save()

        response = self.client.post(reverse('admin-settings-test-alert'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['alert_email'], 'alerts@morktinh.com')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['alerts@morktinh.com'])

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_customer_checkout_sends_order_alert_email(self):
        settings = StoreSettings.load()
        settings.alert_email = 'alerts@morktinh.com'
        settings.email_alerts_enabled = True
        settings.order_alerts_enabled = True
        settings.save()
        category = Category.objects.create(name='Checkout Category')
        brand = Brand.objects.create(name='Checkout Brand')
        product = Product.objects.create(
            category=category,
            brand=brand,
            name='Checkout Product',
            base_price=Decimal('12.00'),
        )
        cart = Cart.objects.create(customer=self.admin)
        CartItem.objects.create(cart=cart, product=product, quantity=1)

        response = self.client.post(reverse('order-list'), {
            'new_address': {
                'recipient_name': 'Admin Customer',
                'address_line1': 'Street 1',
                'phone': '012345678',
                'city': 'Phnom Penh',
                'district': 'Chamkarmon',
                'commune': 'Tonle Bassac',
            },
            'payment_method': Order.PaymentMethod.CASH_ON_DELIVERY,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['alerts@morktinh.com'])
        self.assertIn(f"New order #{response.data['id']}", mail.outbox[0].subject)

    def test_public_settings_exposes_storefront_fields(self):
        settings = StoreSettings.load()
        settings.store_name = 'Public Morktinh'
        settings.announcement_text = 'Weekend sale'
        settings.maintenance_mode = True
        settings.save()

        self.client.force_authenticate(user=None)
        response = self.client.get(reverse('public-settings'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['store_name'], 'Public Morktinh')
        self.assertEqual(response.data['announcement_text'], 'Weekend sale')
        self.assertTrue(response.data['maintenance_mode'])
        self.assertNotIn('low_stock_threshold', response.data)


class ProductListQueryParamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        phones = Category.objects.create(name='Phones')
        accessories = Category.objects.create(name='Accessories')
        apple = Brand.objects.create(name='Apple')
        sony = Brand.objects.create(name='Sony')
        new_tag = ProductTag.objects.create(name='New')
        sale_tag = ProductTag.objects.create(name='Sale')

        self.iphone = Product.objects.create(
            category=phones,
            brand=apple,
            name='iPhone 15',
            description='Flagship phone',
            base_price=Decimal('1000.00'),
            is_feature=True,
        )
        self.iphone.tags.add(new_tag)

        self.airpods = Product.objects.create(
            category=accessories,
            brand=apple,
            name='AirPods',
            description='Wireless earbuds',
            base_price=Decimal('200.00'),
        )
        self.airpods.tags.add(sale_tag)

        self.headphones = Product.objects.create(
            category=accessories,
            brand=sony,
            name='Sony Headphones',
            description='Noise cancelling audio',
            base_price=Decimal('350.00'),
        )

        ProductVariant.objects.create(
            product=self.iphone,
            sku='IPHONE-15',
            stock=5,
            price=Decimal('1000.00'),
        )
        ProductVariant.objects.create(
            product=self.airpods,
            sku='AIRPODS',
            stock=0,
            price=Decimal('200.00'),
        )

        discount = Discount.objects.create(
            name='Phone Sale',
            discount_type='percent',
            value=Decimal('10.00'),
            is_active=True,
            start_date=timezone.now() - timezone.timedelta(days=1),
            end_date=timezone.now() + timezone.timedelta(days=1),
        )
        self.iphone.discounts.add(discount)

    def get_product_names(self, response):
        return [product['name'] for product in response.data['results']]

    def test_product_list_can_filter_by_tag_slug(self):
        response = self.client.get(reverse('product-list'), {
            'tag': 'new',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.get_product_names(response), ['iPhone 15'])

    def test_product_list_can_filter_by_category_and_brand_slug(self):
        response = self.client.get(reverse('product-list'), {
            'category': 'accessories',
            'brand': 'apple',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.get_product_names(response), ['AirPods'])

    def test_product_list_can_search_text_fields(self):
        response = self.client.get(reverse('product-list'), {
            'search': 'audio',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.get_product_names(response), ['Sony Headphones'])

    def test_product_list_can_filter_price_feature_stock_and_discount(self):
        response = self.client.get(reverse('product-list'), {
            'min_price': '500',
            'featured': 'true',
            'in_stock': 'true',
            'has_discount': 'true',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.get_product_names(response), ['iPhone 15'])

    def test_product_list_can_sort_by_price(self):
        response = self.client.get(reverse('product-list'), {
            'sort': 'price_asc',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.get_product_names(response),
            ['AirPods', 'Sony Headphones', 'iPhone 15'],
        )

    def test_product_list_rejects_invalid_query_param_values(self):
        response = self.client.get(reverse('product-list'), {
            'featured': 'maybe',
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['featured'], 'Use true or false.')


class CategoryBrandQueryParamTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        Category.objects.create(name='Phones')
        Category.objects.create(name='Accessories', is_active=False)
        Brand.objects.create(name='Apple')
        Brand.objects.create(name='Sony', is_active=False)

    def test_category_list_can_search_name_or_slug(self):
        response = self.client.get(reverse('category-list'), {
            'search': 'phone',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual([category['name'] for category in response.data['results']], ['Phones'])

    def test_brand_list_can_search_name_or_slug(self):
        response = self.client.get(reverse('brand-list'), {
            'search': 'app',
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual([brand['name'] for brand in response.data['results']], ['Apple'])

    def test_category_and_brand_lists_can_filter_by_active_status(self):
        category_response = self.client.get(reverse('category-list'), {
            'active': 'false',
        })
        brand_response = self.client.get(reverse('brand-list'), {
            'active': 'false',
        })

        self.assertEqual(category_response.status_code, 200)
        self.assertEqual(brand_response.status_code, 200)
        self.assertEqual([category['name'] for category in category_response.data['results']], [])
        self.assertEqual([brand['name'] for brand in brand_response.data['results']], [])

    def test_category_list_rejects_invalid_active_value(self):
        response = self.client.get(reverse('category-list'), {
            'active': 'maybe',
        })

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data['active'], 'Use true or false.')


class ProductTagApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(name='Phones')
        self.brand = Brand.objects.create(name='Apple')

    def test_product_tag_crud_endpoint_creates_managed_tags(self):
        response = self.client.post(reverse('product-tag-list'), {
            'name': 'New Arrival',
            'is_active': True,
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['name'], 'New Arrival')
        self.assertEqual(response.data['slug'], 'new-arrival')

    def test_product_create_accepts_existing_tag_ids(self):
        product_tag = ProductTag.objects.create(name='Featured')

        response = self.client.post(reverse('product-list'), {
            'category': self.category.id,
            'brand': self.brand.id,
            'name': 'iPhone',
            'base_price': '1000.00',
            'tags': [product_tag.id],
        }, format='json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['tags'], [product_tag.id])
        self.assertEqual(response.data['tag_details'][0]['name'], 'Featured')

    def test_inactive_tags_are_hidden_for_public_tag_list(self):
        ProductTag.objects.create(name='Visible')
        ProductTag.objects.create(name='Hidden', is_active=False)

        response = self.client.get(reverse('product-tag-list'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual([tag['name'] for tag in response.data['results']], ['Visible'])
