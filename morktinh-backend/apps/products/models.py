from django.conf import settings
from django.db import models
from django.utils.text import slugify
from django.utils import timezone
from decimal import Decimal


def default_support_email():
    return getattr(settings, 'EMAIL_HOST_USER', 'support@morktinh.com')


# =========================================================
# CATEGORY
# =========================================================
class Category(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'
        ordering = ['-id']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)


# =========================================================
# BRAND
# =========================================================
class Brand(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    image = models.ImageField(
        upload_to='brands/',
        blank=True,
        null=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'brands'
        ordering = ['-id']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)


class Banner(models.Model):
    banner_image = models.ImageField( upload_to='banners/' )
    title = models.CharField( max_length=255, blank=True, null=True )
    description = models.TextField( blank=True, null=True )
    button_title = models.CharField( max_length=100, blank=True, null=True )
    button_color = models.CharField( max_length=50, blank=True, null=True )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    class Meta:
        db_table = 'banners'
        ordering = ['order']
    def __str__(self):
        if self.title:
            return self.title
        return f"Banner #{self.id}"

# =========================================================
# DISCOUNT
# =========================================================
class Discount(models.Model):

    DISCOUNT_TYPE = (
        ('percent', 'Percent'),
        ('fixed', 'Fixed'),
    )

    name = models.CharField(max_length=100)

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE
    )

    value = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    is_global = models.BooleanField(default=False)

    override_product_discount = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    class Meta:
        db_table = 'discounts'

    def __str__(self):
        return self.name


# =========================================================
# PRODUCT TAG
# =========================================================
class ProductTag(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_tags'
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)


# =========================================================
# PRODUCT
# =========================================================
class Product(models.Model):

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products'
    )

    brand = models.ForeignKey(
        Brand,
        on_delete=models.PROTECT,
        related_name='products'
    )

    discounts = models.ManyToManyField(
        Discount,
        blank=True,
        related_name='products'
    )

    tags = models.ManyToManyField(
        ProductTag,
        blank=True,
        related_name='products'
    )

    name = models.CharField(max_length=255)

    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    detail = models.TextField(
        blank=True,
        null=True
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    specification = models.JSONField(
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    is_feature = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-id']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def get_active_discounts(self):
        now = timezone.now()

        product_discounts = self.discounts.filter(
            is_active=True,
            is_global=False,
            start_date__lte=now,
            end_date__gte=now
        )

        global_discounts = Discount.objects.filter(
            is_active=True,
            is_global=True,
            start_date__lte=now,
            end_date__gte=now
        )

        override_global_discounts = global_discounts.filter(
            override_product_discount=True
        )

        if override_global_discounts.exists():
            return list(override_global_discounts)

        if product_discounts.exists():
            return list(product_discounts)

        return []

    def get_discount_amount(self, discount, price):
        if discount.discount_type == 'percent':
            return price * discount.value / Decimal('100')

        return min(discount.value, price)

    def get_active_discount(self, price=None):
        price = price if price is not None else self.base_price
        discounts = self.get_active_discounts()

        if not discounts:
            return None

        return max(
            discounts,
            key=lambda discount: self.get_discount_amount(discount, price)
        )

    @property
    def final_price(self):
        discount = self.get_active_discount()

        if not discount:
            return self.base_price

        return self.base_price - self.get_discount_amount(discount, self.base_price)


# =========================================================
# PRODUCT MEDIA
# =========================================================
class ProductMedia(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='medias'
    )

    image = models.ImageField(
        upload_to='products/'
    )

    is_thumbnail = models.BooleanField(default=False)

    class Meta:
        db_table = 'product_medias'

    def __str__(self):
        return self.product.name


# =========================================================
# PRODUCT VIDEO
# =========================================================
class ProductVideo(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='videos'
    )

    video_url = models.URLField()

    is_main = models.BooleanField(default=False)

    class Meta:
        db_table = 'product_videos'

    def __str__(self):
        return self.product.name


# =========================================================
# OPTION GROUP
# Examples:
# Color, Storage, Size, RAM
# =========================================================
class ProductOptionGroup(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='option_groups'
    )

    title = models.CharField(max_length=100)

    class Meta:
        db_table = 'product_option_groups'

    def __str__(self):
        return f"{self.product.name} - {self.title}"


# =========================================================
# OPTION
# Examples:
# Red, Blue, 128GB, 256GB
# =========================================================
class ProductOption(models.Model):

    group = models.ForeignKey(
        ProductOptionGroup,
        on_delete=models.CASCADE,
        related_name='options'
    )

    value = models.CharField(max_length=100)

    class Meta:
        db_table = 'product_options'

    def __str__(self):
        return self.value


# =========================================================
# PRODUCT VARIANT
# =========================================================
class ProductVariant(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants'
    )

    sku = models.CharField(
        max_length=255,
        unique=True
    )

    stock = models.PositiveIntegerField(default=0)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    image = models.ImageField(
        upload_to='variants/',
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_variants'

    def __str__(self):
        return self.sku

    @property
    def variant_final_price(self):

        discount = self.product.get_active_discount(self.price)

        if not discount:
            return self.price

        return self.price - self.product.get_discount_amount(discount, self.price)


# =========================================================
# VARIANT OPTION
# Variant -> Selected Option
# =========================================================
class VariantOption(models.Model):

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='variant_options'
    )

    option = models.ForeignKey(
        ProductOption,
        on_delete=models.CASCADE,
        related_name='variant_options'
    )

    class Meta:
        db_table = 'variant_options'

        unique_together = (
            'variant',
            'option',
        )

    def __str__(self):
        return f"{self.variant.sku} - {self.option.value}"


# =========================================================
# FREE ITEM
# =========================================================
class ProductFreeItem(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='free_items'
    )

    name = models.CharField(max_length=255)

    image = models.ImageField(
        upload_to='free_items/',
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'product_free_items'

    def __str__(self):
        return self.name


class Cart(models.Model):

    customer = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='carts',
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carts'
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(
                fields=['customer'],
                condition=models.Q(is_active=True),
                name='unique_active_cart_per_customer',
            ),
        ]

    def __str__(self):
        return f"{self.customer.email} cart"


class CartItem(models.Model):

    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='cart_items',
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='cart_items',
        blank=True,
        null=True,
    )

    quantity = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cart_items'
        ordering = ['created_at', 'id']
        constraints = [
            models.UniqueConstraint(
                fields=['cart', 'product'],
                condition=models.Q(variant__isnull=True),
                name='unique_cart_product_without_variant',
            ),
            models.UniqueConstraint(
                fields=['cart', 'product', 'variant'],
                name='unique_cart_product_variant',
            ),
        ]

    def __str__(self):
        return f"{self.cart.customer.email} - {self.product.name}"


class Order(models.Model):

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        SHIPPED = 'shipped', 'Shipped'
        DELIVERED = 'delivered', 'Delivered'
        CANCELLED = 'cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "Cash On Delivery"
        BANK_TRANSFER = "bank_transfer", "Bank Transfer"
        KHQR = "khqr", "KHQR"

    customer = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        related_name='orders',
        blank=True,
        null=True,
    )

    address = models.ForeignKey(
        'users.CustomerAddress',
        on_delete=models.SET_NULL,
        related_name='orders',
        blank=True,
        null=True,
    )

    recipient_name = models.CharField(max_length=255)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    commune = models.CharField(max_length=100)
    contact_email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True)
    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH_ON_DELIVERY,
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING,
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        customer = self.customer.email if self.customer else self.recipient_name
        return f"Order #{self.id} - {customer}"


class OrderItem(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
    )

    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name='order_items',
        blank=True,
        null=True,
    )

    product_name = models.CharField(max_length=255)
    variant_sku = models.CharField(max_length=255, blank=True)
    variant_attributes = models.JSONField(blank=True, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_items'
        ordering = ['id']

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"


class PaymentTransaction(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        EXPIRED = "expired", "Expired"

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    khqr_payload = models.TextField()

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "payment_transactions"

    def __str__(self):
        return f"Order #{self.order.id}"


class StoreSettings(models.Model):
    store_name = models.CharField(max_length=120, default='Morktinh')
    support_email = models.EmailField(default=default_support_email)
    alert_email = models.EmailField(default=default_support_email)
    support_phone = models.CharField(max_length=30, blank=True)
    currency_code = models.CharField(max_length=3, default='USD')
    default_shipping_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )
    low_stock_threshold = models.PositiveIntegerField(default=5)
    email_alerts_enabled = models.BooleanField(default=True)
    order_alerts_enabled = models.BooleanField(default=True)
    compact_dashboard = models.BooleanField(default=False)
    allow_out_of_stock_cart = models.BooleanField(default=False)
    maintenance_mode = models.BooleanField(default=False)
    announcement_text = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'store_settings'
        verbose_name = 'Store Settings'
        verbose_name_plural = 'Store Settings'

    def __str__(self):
        return self.store_name

    @classmethod
    def load(cls):
        settings, _ = cls.objects.get_or_create(pk=1)
        return settings
