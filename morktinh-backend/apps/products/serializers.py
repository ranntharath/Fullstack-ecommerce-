from rest_framework import serializers
from django.db import transaction
from decimal import Decimal

from apps.users.models import CustomerAddress, User

from .services import send_new_order_alert_email
from .models import (
    Banner,
    Brand,
    Cart,
    CartItem,
    Category,
    Discount,
    Order,
    OrderItem,
    PaymentTransaction,
    Product,
    ProductFreeItem,
    ProductMedia,
    ProductOption,
    ProductOptionGroup,
    ProductTag,
    ProductVariant,
    ProductVideo,
    StoreSettings,
    VariantOption,
)


class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = [
            'store_name',
            'support_email',
            'alert_email',
            'support_phone',
            'currency_code',
            'default_shipping_fee',
            'low_stock_threshold',
            'email_alerts_enabled',
            'order_alerts_enabled',
            'compact_dashboard',
            'allow_out_of_stock_cart',
            'maintenance_mode',
            'announcement_text',
            'updated_at',
        ]
        read_only_fields = ['updated_at']

    def validate_currency_code(self, value):
        normalized_value = value.upper()
        if len(normalized_value) != 3 or not normalized_value.isalpha():
            raise serializers.ValidationError('Use a 3-letter currency code.')
        return normalized_value

    def validate_low_stock_threshold(self, value):
        if value < 1:
            raise serializers.ValidationError('Use at least 1.')
        return value


class PublicStoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = [
            'store_name',
            'support_email',
            'support_phone',
            'currency_code',
            'maintenance_mode',
            'announcement_text',
        ]

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'image',
            'slug',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = [
            'id',
            'name',
            'image',
            'slug',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = [
            'id',
            'banner_image',
            'title',
            'description',
            'button_title',
            'button_color',
            'is_active',
            'order',
        ]
        read_only_fields = ['id']


class DiscountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discount
        fields = [
            'id',
            'name',
            'discount_type',
            'value',
            'is_global',
            'override_product_discount',
            'is_active',
            'start_date',
            'end_date',
        ]
        read_only_fields = ['id']

class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = [
            'id',
            'name',
            'slug',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = [
            'id',
            'product',
            'image',
            'is_thumbnail',
        ]
        read_only_fields = ['id']

class ProductVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVideo
        fields = [
            'id',
            'product',
            'video_url',
            'is_main',
        ]
        read_only_fields = ['id']


class ProductOptionSerializer(serializers.ModelSerializer):

    group_title = serializers.CharField(
        source='group.title',
        read_only=True
    )

    class Meta:
        model = ProductOption
        fields = [
            'id',
            'group',
            'group_title',
            'value',
        ]
        read_only_fields = ['id']

class ProductOptionGroupSerializer(serializers.ModelSerializer):

    options = ProductOptionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = ProductOptionGroup
        fields = [
            'id',
            'product',
            'title',
            'options',
        ]
        read_only_fields = ['id']


class VariantOptionSerializer(serializers.ModelSerializer):

    option_detail = ProductOptionSerializer(
        source='option',
        read_only=True
    )

    class Meta:
        model = VariantOption
        fields = [
            'id',
            'variant',
            'option',
            'option_detail',
        ]
        read_only_fields = ['id']

class ProductVariantSerializer(serializers.ModelSerializer):

    clear_image = serializers.BooleanField(
        write_only=True,
        required=False,
        default=False,
    )

    variant_options = VariantOptionSerializer(
        many=True,
        read_only=True
    )

    variant_final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    attributes = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'sku',
            'stock',
            'price',
            'variant_final_price',
            'image',
            'clear_image',
            'is_active',
            'created_at',
            'updated_at',
            'attributes',
            'variant_options',
        ]
        read_only_fields = [
            'id',
            'variant_final_price',
            'created_at',
            'updated_at',
        ]

    def get_attributes(self, obj):

        result = {}

        for item in obj.variant_options.select_related(
            'option__group'
        ):
            result[
                item.option.group.title
            ] = item.option.value

        return result

    def create(self, validated_data):
        validated_data.pop('clear_image', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        clear_image = validated_data.pop('clear_image', False)
        instance = super().update(instance, validated_data)

        if clear_image:
            instance.image = None
            instance.save(update_fields=['image'])

        return instance


class ProductFreeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFreeItem
        fields = [
            'id',
            'product',
            'name',
            'image',
            'is_active',
        ]
        read_only_fields = ['id']


class ProductListSerializer(serializers.ModelSerializer):

    category_detail = CategorySerializer(
        source='category',
        read_only=True
    )

    brand_detail = BrandSerializer(
        source='brand',
        read_only=True
    )

    discount_details = DiscountSerializer(
        source='discounts',
        many=True,
        read_only=True,
    )

    active_discount = serializers.SerializerMethodField()

    tag_details = ProductTagSerializer(
        source='tags',
        many=True,
        read_only=True,
    )

    medias = ProductMediaSerializer(
        many=True,
        read_only=True
    )

    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    variants_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_detail',
            'brand',
            'brand_detail',
            'discounts',
            'discount_details',
            'active_discount',
            'tags',
            'tag_details',
            'name',
            'slug',
            'base_price',
            'final_price',
            'is_active',
            'is_feature',
            'created_at',
            'updated_at',
            'medias',
            'variants_count',
        ]

    def get_active_discount(self, obj):
        discount = obj.get_active_discount()

        if not discount:
            return None

        return DiscountSerializer(discount).data

    def get_variants_count(self, obj):
        annotated_count = getattr(obj, 'variants_count', None)

        if annotated_count is not None:
            return annotated_count

        return obj.variants.count()

class ProductSerializer(serializers.ModelSerializer):

    category_detail = CategorySerializer(
        source='category',
        read_only=True
    )

    brand_detail = BrandSerializer(
        source='brand',
        read_only=True
    )

    discount_details = DiscountSerializer(
        source='discounts',
        many=True,
        read_only=True,
    )

    active_discount = serializers.SerializerMethodField()

    tag_details = ProductTagSerializer(
        source='tags',
        many=True,
        read_only=True,
    )

    medias = ProductMediaSerializer(
        many=True,
        read_only=True
    )

    videos = ProductVideoSerializer(
        many=True,
        read_only=True
    )

    option_groups = ProductOptionGroupSerializer(
        many=True,
        read_only=True
    )

    variants = ProductVariantSerializer(
        many=True,
        read_only=True
    )

    free_items = ProductFreeItemSerializer(
        many=True,
        read_only=True
    )

    final_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Product
        fields = [
            'id',

            'category',
            'category_detail',

            'brand',
            'brand_detail',

            'discounts',
            'discount_details',
            'active_discount',
            'tags',
            'tag_details',

            'name',
            'slug',

            'description',
            'detail',

            'base_price',
            'final_price',

            'specification',

            'is_active',
            'is_feature',

            'created_at',
            'updated_at',

            'medias',
            'videos',

            'option_groups',
            'variants',

            'free_items',
        ]

        read_only_fields = [
            'id',
            'slug',
            'final_price',
            'tag_details',
            'created_at',
            'updated_at',
        ]

    def get_active_discount(self, obj):
        discount = obj.get_active_discount()

        if not discount:
            return None

        return DiscountSerializer(discount).data

    def validate(self, attrs):
        discounts = attrs.get('discounts')

        if discounts is not None:
            global_discounts = [
                discount for discount in discounts if discount.is_global
            ]
            product_discounts = [
                discount for discount in discounts if not discount.is_global
            ]

            if global_discounts:
                raise serializers.ValidationError({
                    'discounts': 'Global discounts apply automatically and cannot be assigned to a product.'
                })

            if len(product_discounts) > 1:
                raise serializers.ValidationError({
                    'discounts': 'Select only one product discount.'
                })

        return attrs


class CartItemSerializer(serializers.ModelSerializer):

    product_detail = ProductListSerializer(
        source='product',
        read_only=True,
    )

    variant_detail = ProductVariantSerializer(
        source='variant',
        read_only=True,
    )

    unit_price = serializers.SerializerMethodField()

    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            'id',
            'cart',
            'product',
            'product_detail',
            'variant',
            'variant_detail',
            'quantity',
            'unit_price',
            'line_total',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'cart',
            'product_detail',
            'variant_detail',
            'unit_price',
            'line_total',
            'created_at',
            'updated_at',
        ]

    def get_unit_price(self, obj):
        if obj.variant:
            return obj.variant.variant_final_price

        return obj.product.final_price

    def get_line_total(self, obj):
        return self.get_unit_price(obj) * obj.quantity

    def validate(self, attrs):
        product = attrs.get('product') or getattr(self.instance, 'product', None)
        variant = attrs.get('variant') or getattr(self.instance, 'variant', None)
        quantity = attrs.get('quantity', getattr(self.instance, 'quantity', 1))

        if quantity < 1:
            raise serializers.ValidationError({
                'quantity': 'Quantity must be at least 1.'
            })

        if not product:
            return attrs

        if not product.is_active or not product.category.is_active or not product.brand.is_active:
            raise serializers.ValidationError({
                'product': 'This product is not available.'
            })

        if variant:
            if variant.product_id != product.id:
                raise serializers.ValidationError({
                    'variant': 'This variant does not belong to the selected product.'
                })

            if not variant.is_active:
                raise serializers.ValidationError({
                    'variant': 'This variant is not available.'
                })

            if (
                quantity > variant.stock
                and not StoreSettings.load().allow_out_of_stock_cart
            ):
                raise serializers.ValidationError({
                    'quantity': 'Quantity exceeds available stock.'
                })

        return attrs


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    items_count = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            'id',
            'customer',
            'is_active',
            'items',
            'items_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'customer',
            'items',
            'items_count',
            'subtotal',
            'created_at',
            'updated_at',
        ]

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_subtotal(self, obj):
        total = sum(
            CartItemSerializer().get_line_total(item)
            for item in obj.items.all()
        )

        return str(total)


class OrderItemSerializer(serializers.ModelSerializer):

    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'variant',
            'product_image',
            'product_name',
            'variant_sku',
            'variant_attributes',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = fields

    def get_product_image(self, obj):
        if obj.variant and obj.variant.image:
            return obj.variant.image.url

        thumbnail = obj.product.medias.filter(is_thumbnail=True).first()
        if thumbnail:
            return thumbnail.image.url

        media = obj.product.medias.first()
        if media:
            return media.image.url

        return None


class CheckoutAddressSerializer(serializers.Serializer):
    recipient_name = serializers.CharField(max_length=255)
    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        allow_null=True,
    )
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    commune = serializers.CharField(max_length=100)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'address',
            'recipient_name',
            'address_line1',
            'address_line2',
            'phone',
            'city',
            'district',
            'commune',
            'contact_email',
            'notes',
            'payment_method',
            'status',
            'subtotal',
            'shipping_fee',
            'total',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class AdminOrderSerializer(OrderSerializer):
    customer_email = serializers.SerializerMethodField()
    customer_name = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + [
            'customer_email',
            'customer_name',
            'payment_status',
        ]
        read_only_fields = [
            field for field in fields if field != 'status'
        ]

    def get_customer_name(self, obj):
        if not obj.customer:
            return obj.recipient_name
        return f'{obj.customer.first_name} {obj.customer.last_name}'.strip() or obj.customer.email

    def get_customer_email(self, obj):
        return obj.customer.email if obj.customer else obj.contact_email

    def get_payment_status(self, obj):
        try:
            return obj.payment.status
        except PaymentTransaction.DoesNotExist:
            return None


class AdminOrderItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True),
        required=False,
        allow_null=True,
    )
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        product = attrs['product']
        variant = attrs.get('variant')
        if variant and variant.product_id != product.id:
            raise serializers.ValidationError({'variant': 'This variant does not belong to the selected product.'})
        if product.variants.filter(is_active=True).exists() and not variant:
            raise serializers.ValidationError({'variant': 'Choose a variant for this product.'})
        return attrs


class CreateAdminOrderSerializer(serializers.Serializer):
    customer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Roles.CUSTOMER, is_active=True),
        required=False,
        allow_null=True,
    )
    recipient_name = serializers.CharField(max_length=255)
    address_line1 = serializers.CharField(max_length=255)
    address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20)
    city = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    commune = serializers.CharField(max_length=100)
    contact_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.CASH_ON_DELIVERY,
    )
    shipping_fee = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0'), default=0)
    items = AdminOrderItemInputSerializer(many=True, allow_empty=False)

    def create(self, validated_data):
        items = validated_data.pop('items')
        customer = validated_data.get('customer')
        if customer and not validated_data.get('contact_email'):
            validated_data['contact_email'] = customer.email

        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            subtotal = Decimal('0')
            for item in items:
                product = item['product']
                variant = item.get('variant')
                quantity = item['quantity']
                variant_attributes = None

                if variant:
                    variant = ProductVariant.objects.select_for_update().get(pk=variant.pk)
                    if not variant.is_active or variant.stock < quantity:
                        raise serializers.ValidationError({
                            'items': f'{variant.sku} only has {variant.stock} in stock.'
                        })
                    unit_price = variant.variant_final_price
                    variant_attributes = ProductVariantSerializer().get_attributes(variant)
                    variant.stock -= quantity
                    variant.save(update_fields=['stock', 'updated_at'])
                else:
                    unit_price = product.final_price

                line_total = unit_price * quantity
                subtotal += line_total
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    variant=variant,
                    product_name=product.name,
                    variant_sku=variant.sku if variant else '',
                    variant_attributes=variant_attributes,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )

            order.subtotal = subtotal
            order.total = subtotal + order.shipping_fee
            order.save(update_fields=['subtotal', 'total', 'updated_at'])

        send_new_order_alert_email(order)
        return order


class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False)
    new_address = CheckoutAddressSerializer(required=False)
    save_address = serializers.BooleanField(required=False, default=False)
    contact_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default=Order.PaymentMethod.CASH_ON_DELIVERY,
    )

    def validate(self, attrs):
        request = self.context['request']
        address_id = attrs.get('address_id')
        new_address = attrs.get('new_address')

        if bool(address_id) == bool(new_address):
            raise serializers.ValidationError({
                'address': 'Choose an existing address or enter a new address.'
            })

        if address_id:
            try:
                attrs['address'] = CustomerAddress.objects.get(
                    id=address_id,
                    customer=request.user,
                )
            except CustomerAddress.DoesNotExist as exc:
                raise serializers.ValidationError({
                    'address_id': 'Address was not found.'
                }) from exc

        cart = Cart.objects.filter(
            customer=request.user,
            is_active=True,
        ).prefetch_related(
            'items',
            'items__product',
            'items__variant',
            'items__variant__variant_options__option__group',
        ).first()

        if not cart or not cart.items.exists():
            raise serializers.ValidationError({
                'cart': 'Your cart is empty.'
            })

        for item in cart.items.all():
            if not item.product.is_active:
                raise serializers.ValidationError({
                    'cart': f'{item.product.name} is no longer available.'
                })

            if item.variant:
                if not item.variant.is_active:
                    raise serializers.ValidationError({
                        'cart': f'{item.variant.sku} is no longer available.'
                    })

                if item.quantity > item.variant.stock:
                    raise serializers.ValidationError({
                        'cart': f'{item.variant.sku} only has {item.variant.stock} in stock.'
                    })

        attrs['cart'] = cart
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        cart = validated_data['cart']
        address = validated_data.get('address')
        new_address = validated_data.get('new_address')

        with transaction.atomic():
            if not address:
                if validated_data.get('save_address'):
                    address = CustomerAddress.objects.create(
                        customer=request.user,
                        **new_address,
                    )
                address_data = new_address
            else:
                address_data = {
                    'recipient_name': address.recipient_name,
                    'address_line1': address.address_line1,
                    'address_line2': address.address_line2,
                    'phone': address.phone,
                    'city': address.city,
                    'district': address.district,
                    'commune': address.commune,
                }

            order = Order.objects.create(
                customer=request.user,
                address=address,
                contact_email=validated_data.get('contact_email') or request.user.email,
                notes=validated_data.get('notes', ''),
                payment_method=validated_data.get('payment_method'),
                shipping_fee=StoreSettings.load().default_shipping_fee,
                **address_data,
            )

            subtotal = 0
            for cart_item in cart.items.all():
                unit_price = (
                    cart_item.variant.variant_final_price
                    if cart_item.variant
                    else cart_item.product.final_price
                )
                line_total = unit_price * cart_item.quantity
                subtotal += line_total
                variant_attributes = None

                if cart_item.variant:
                    variant_attributes = ProductVariantSerializer().get_attributes(cart_item.variant)
                    cart_item.variant.stock -= cart_item.quantity
                    cart_item.variant.save(update_fields=['stock', 'updated_at'])

                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    variant=cart_item.variant,
                    product_name=cart_item.product.name,
                    variant_sku=cart_item.variant.sku if cart_item.variant else '',
                    variant_attributes=variant_attributes,
                    quantity=cart_item.quantity,
                    unit_price=unit_price,
                    line_total=line_total,
                )

            order.subtotal = subtotal
            order.total = subtotal + order.shipping_fee
            order.save(update_fields=['subtotal', 'total', 'updated_at'])
            cart.is_active = False
            cart.save(update_fields=['is_active', 'updated_at'])

        send_new_order_alert_email(order)
        return order

