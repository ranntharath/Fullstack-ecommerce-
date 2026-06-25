from datetime import timedelta
from decimal import Decimal, InvalidOperation

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import SAFE_METHODS, BasePermission
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from apps.users.permissions import IsAdmin

from .services import create_khqr_payment, check_khqr_payment, send_store_alert_email

from .models import (
    Banner,
    Brand,
    Cart,
    CartItem,
    Category,
    Discount,
    Order,
    Product,
    ProductFreeItem,
    ProductMedia,
    ProductOption,
    ProductOptionGroup,
    ProductTag,
    ProductVariant,
    ProductVideo,
    PaymentTransaction,
    StoreSettings,
    VariantOption,
    OrderItem
)

from .serializers import (
    BannerSerializer,
    BrandSerializer,
    CartSerializer,
    CartItemSerializer,
    CategorySerializer,
    DiscountSerializer,
    AdminOrderSerializer,
    CreateAdminOrderSerializer,
    CreateOrderSerializer,
    OrderSerializer,
    ProductFreeItemSerializer,
    ProductMediaSerializer,
    ProductOptionGroupSerializer,
    ProductOptionSerializer,
    ProductListSerializer,
    ProductSerializer,
    ProductTagSerializer,
    ProductVariantSerializer,
    ProductVideoSerializer,
    PublicStoreSettingsSerializer,
    StoreSettingsSerializer,
    VariantOptionSerializer,
)

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        store_settings = StoreSettings.load()
        now = timezone.now()
        today = timezone.localdate()
        current_period = now - timedelta(days=30)
        previous_period = now - timedelta(days=60)
        valid_orders = Order.objects.exclude(status=Order.Status.CANCELLED)

        def percentage_change(current, previous):
            current = Decimal(current or 0)
            previous = Decimal(previous or 0)
            if previous == 0:
                return 100 if current > 0 else 0
            return round(float((current - previous) / previous * 100), 1)

        current_orders = valid_orders.filter(created_at__gte=current_period)
        previous_orders = valid_orders.filter(
            created_at__gte=previous_period,
            created_at__lt=current_period,
        )
        current_revenue = current_orders.aggregate(total=Sum('total'))['total'] or 0
        previous_revenue = previous_orders.aggregate(total=Sum('total'))['total'] or 0
        daily_totals = {
            row['day']: row['total'] or 0
            for row in valid_orders.filter(
                created_at__date__gte=today - timedelta(days=6)
            ).annotate(day=TruncDate('created_at')).values('day').annotate(
                total=Sum('total')
            )
        }
        sales_trend = [
            {
                'date': (today - timedelta(days=offset)).isoformat(),
                'revenue': str(daily_totals.get(today - timedelta(days=offset), 0)),
            }
            for offset in range(6, -1, -1)
        ]

        status_counts = {
            row['status']: row['count']
            for row in Order.objects.values('status').annotate(count=Count('id'))
        }
        order_statuses = [
            {
                'status': value,
                'label': label,
                'count': status_counts.get(value, 0),
            }
            for value, label in Order.Status.choices
        ]

        recent_orders = [
            {
                'id': order.id,
                'customer': (
                    f'{order.customer.first_name} {order.customer.last_name}'.strip()
                    or order.customer.email
                ) if order.customer else order.recipient_name,
                'email': order.customer.email if order.customer else order.contact_email,
                'total': str(order.total),
                'status': order.status,
                'created_at': order.created_at,
            }
            for order in Order.objects.select_related('customer')[:6]
        ]

        low_stock_queryset = ProductVariant.objects.filter(
            is_active=True,
            stock__lte=store_settings.low_stock_threshold,
        ).select_related('product').order_by('stock', 'product__name')
        low_stock_items = [
            {
                'id': variant.id,
                'product_id': variant.product_id,
                'product_name': variant.product.name,
                'sku': variant.sku,
                'stock': variant.stock,
            }
            for variant in low_stock_queryset[:6]
        ]

        return Response({
            'summary': {
                'revenue': str(valid_orders.aggregate(total=Sum('total'))['total'] or 0),
                'orders': Order.objects.count(),
                'customers': User.objects.filter(role=User.Roles.CUSTOMER).count(),
                'products': Product.objects.count(),
                'low_stock_count': low_stock_queryset.count(),
                'revenue_change': percentage_change(current_revenue, previous_revenue),
                'orders_change': percentage_change(current_orders.count(), previous_orders.count()),
                'pending_orders': status_counts.get(Order.Status.PENDING, 0),
                'low_stock_threshold': store_settings.low_stock_threshold,
                'order_alerts_enabled': store_settings.order_alerts_enabled,
            },
            'sales_trend': sales_trend,
            'order_statuses': order_statuses,
            'recent_orders': recent_orders,
            'low_stock_items': low_stock_items,
        })


class AdminStoreSettingsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        serializer = StoreSettingsSerializer(StoreSettings.load())
        return Response(serializer.data)

    def patch(self, request):
        serializer = StoreSettingsSerializer(
            StoreSettings.load(),
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminStoreSettingsTestAlertView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        store_settings = StoreSettings.load()

        if not store_settings.email_alerts_enabled:
            raise ValidationError({
                'email_alerts_enabled': 'Turn on Email alerts before sending a test alert.'
            })

        if not store_settings.order_alerts_enabled:
            raise ValidationError({
                'order_alerts_enabled': 'Turn on New order alerts before sending a test alert.'
            })

        if not store_settings.alert_email:
            raise ValidationError({
                'alert_email': 'Set an alert email before sending a test alert.'
            })

        sent = send_store_alert_email(
            subject=f'Test alert - {store_settings.store_name}',
            message=(
                f'This is a test alert from {store_settings.store_name}.\n\n'
                'If you received this email, admin alerts are working.'
            ),
            fail_silently=False,
        )

        return Response({
            'sent': sent,
            'alert_email': store_settings.alert_email,
        })


class PublicStoreSettingsView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        serializer = PublicStoreSettingsSerializer(StoreSettings.load())
        return Response(serializer.data)


class StandardResultsPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class AdminOrderPagination(StandardResultsPagination):
    pass


class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAdmin]
    pagination_class = AdminOrderPagination
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateAdminOrderSerializer
        return AdminOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            AdminOrderSerializer(order, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    def get_queryset(self):
        queryset = Order.objects.select_related(
            'customer',
            'address',
            'payment',
        ).prefetch_related(
            'items',
            'items__product__medias',
            'items__variant',
        )
        status_value = self.request.query_params.get('status')
        payment_method = self.request.query_params.get('payment_method')
        search = self.request.query_params.get('search', '').strip()

        if status_value:
            queryset = queryset.filter(status=status_value)
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        if search:
            search_filter = (
                Q(customer__email__icontains=search)
                | Q(recipient_name__icontains=search)
                | Q(phone__icontains=search)
            )
            if search.isdigit():
                search_filter |= Q(id=int(search))
            queryset = queryset.filter(search_filter)

        return queryset

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        all_orders = Order.objects.all()
        response.data['summary'] = {
            'orders': all_orders.count(),
            'pending': all_orders.filter(status=Order.Status.PENDING).count(),
            'delivered': all_orders.filter(status=Order.Status.DELIVERED).count(),
            'order_value': str(
                all_orders.exclude(status=Order.Status.CANCELLED).aggregate(
                    total=Sum('total')
                )['total'] or 0
            ),
        }
        return response

def get_bool_query_param(request, name):
    value = request.query_params.get(name)

    if value is None or value == "":
        return None

    normalized_value = value.lower()

    if normalized_value in ["1", "true", "yes"]:
        return True

    if normalized_value in ["0", "false", "no"]:
        return False

    raise ValidationError({
        name: "Use true or false."
    })


def apply_name_slug_list_query_params(request, queryset):
    search = request.query_params.get("search") or request.query_params.get("q")
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(slug__icontains=search)
        )

    is_active = get_bool_query_param(request, "active")
    if is_active is not None:
        queryset = queryset.filter(is_active=is_active)

    return queryset


class IsAdminOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )
    
class CategoryViewSet(viewsets.ModelViewSet):

    serializer_class = CategorySerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):

        queryset = Category.objects.all()
        queryset = apply_name_slug_list_query_params(self.request, queryset)

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True
        )


class BrandViewSet(viewsets.ModelViewSet):

    serializer_class = BrandSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):

        queryset = Brand.objects.all()
        queryset = apply_name_slug_list_query_params(self.request, queryset)

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True
        )


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    pagination_class = StandardResultsPagination
    # permission_classes = [IsAdminOrReadOnly]


class DiscountViewSet(viewsets.ModelViewSet):

    serializer_class = DiscountSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):

        queryset = Discount.objects.all()

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True
        )

class ProductTagViewSet(viewsets.ModelViewSet):

    serializer_class = ProductTagSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):

        queryset = ProductTag.objects.all()

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True
        )

class ProductViewSet(viewsets.ModelViewSet):

    serializer_class = ProductSerializer
    pagination_class = StandardResultsPagination
    ordering_map = {
        "newest": "-created_at",
        "oldest": "created_at",
        "price_asc": "base_price",
        "price_desc": "-base_price",
        "name_asc": "name",
        "name_desc": "-name",
    }

    def get_serializer_class(self):
        if self.action == "list":
            return ProductListSerializer

        return ProductSerializer

    def get_bool_query_param(self, name):
        return get_bool_query_param(self.request, name)

    def get_decimal_query_param(self, name):
        value = self.request.query_params.get(name)

        if value is None or value == "":
            return None

        try:
            return Decimal(value)
        except InvalidOperation:
            raise ValidationError({
                name: "Use a valid number."
            })

    def get_list_query_values(self, name):
        values = []

        for value in self.request.query_params.getlist(name):
            values.extend([
                item.strip()
                for item in value.split(",")
                if item.strip()
            ])

        return values

    def apply_list_query_params(self, queryset):
        params = self.request.query_params

        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(detail__icontains=search)
                | Q(category__name__icontains=search)
                | Q(brand__name__icontains=search)
                | Q(tags__name__icontains=search)
                | Q(tags__slug__icontains=search)
            )

        category = params.get("category")
        if category:
            if category.isdigit():
                queryset = queryset.filter(category_id=category)
            else:
                queryset = queryset.filter(category__slug=category)

        brand = params.get("brand")
        if brand:
            if brand.isdigit():
                queryset = queryset.filter(brand_id=brand)
            else:
                queryset = queryset.filter(brand__slug=brand)

        tags = self.get_list_query_values("tag")
        if tags:
            queryset = queryset.filter(
                Q(tags__slug__in=tags)
                | Q(tags__name__in=tags)
            )

        is_feature = self.get_bool_query_param("featured")
        if is_feature is not None:
            queryset = queryset.filter(is_feature=is_feature)

        is_active = self.get_bool_query_param("active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        in_stock = self.get_bool_query_param("in_stock")
        if in_stock is True:
            queryset = queryset.filter(
                variants__is_active=True,
                variants__stock__gt=0,
            )
        elif in_stock is False:
            queryset = queryset.exclude(
                variants__is_active=True,
                variants__stock__gt=0,
            )

        min_price = self.get_decimal_query_param("min_price")
        if min_price is not None:
            queryset = queryset.filter(base_price__gte=min_price)

        max_price = self.get_decimal_query_param("max_price")
        if max_price is not None:
            queryset = queryset.filter(base_price__lte=max_price)

        has_discount = self.get_bool_query_param("has_discount")
        if has_discount is not None:
            now = timezone.now()
            active_product_discount = Q(
                discounts__is_active=True,
                discounts__is_global=False,
                discounts__start_date__lte=now,
                discounts__end_date__gte=now,
            )
            active_global_override_exists = Discount.objects.filter(
                is_active=True,
                is_global=True,
                override_product_discount=True,
                start_date__lte=now,
                end_date__gte=now,
            ).exists()

            if has_discount and not active_global_override_exists:
                queryset = queryset.filter(active_product_discount)
            elif not has_discount and active_global_override_exists:
                queryset = queryset.none()
            elif not has_discount:
                queryset = queryset.exclude(active_product_discount)

        sort = params.get("sort")
        if sort:
            ordering = self.ordering_map.get(sort)

            if ordering is None:
                raise ValidationError({
                    "sort": "Use newest, oldest, price_asc, price_desc, name_asc, or name_desc."
                })

            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-id')

        return queryset.distinct()

    def get_queryset(self):

        queryset = Product.objects.select_related(
            "category",
            "brand",
        )

        if self.action == "list":
            queryset = queryset.prefetch_related(
                "discounts",
                "tags",
                "medias",
            ).annotate(
                variants_count=Count("variants")
            )
        else:
            queryset = queryset.prefetch_related(
                "discounts",
                "tags",
                "medias",
                "videos",
                "option_groups__options",
                "variants__variant_options__option__group",
                "free_items",
            )

        user = self.request.user

        if not (user.is_authenticated and user.role == "admin"):
            queryset = queryset.filter(
                is_active=True,
                category__is_active=True,
                brand__is_active=True,
            )

        if self.action == "list":
            return self.apply_list_query_params(queryset)

        return queryset

class ProductMediaViewSet(viewsets.ModelViewSet):

    queryset = ProductMedia.objects.select_related(
        "product"
    )

    serializer_class = ProductMediaSerializer
    pagination_class = StandardResultsPagination

class ProductVideoViewSet(viewsets.ModelViewSet):

    queryset = ProductVideo.objects.select_related(
        "product"
    )

    serializer_class = ProductVideoSerializer

class ProductOptionGroupViewSet(
    viewsets.ModelViewSet
):

    queryset = ProductOptionGroup.objects.select_related(
        "product"
    ).prefetch_related(
        "options"
    )

    serializer_class = ProductOptionGroupSerializer

class ProductOptionViewSet(
    viewsets.ModelViewSet
):

    queryset = ProductOption.objects.select_related(
        "group",
        "group__product",
    )

    serializer_class = ProductOptionSerializer

class ProductVariantViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ProductVariantSerializer

    def get_queryset(self):

        queryset = ProductVariant.objects.select_related(
            "product",
            "product__category",
            "product__brand",
        ).prefetch_related(
            "product__discounts",
            "variant_options__option__group",
        )

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True,
            product__is_active=True,
            product__category__is_active=True,
            product__brand__is_active=True,
        )

class VariantOptionViewSet(
    viewsets.ModelViewSet
):

    queryset = VariantOption.objects.select_related(
        "variant",
        "option",
        "option__group",
    )

    serializer_class = VariantOptionSerializer


class ProductFreeItemViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ProductFreeItemSerializer

    def get_queryset(self):

        queryset = ProductFreeItem.objects.select_related(
            "product"
        )

        user = self.request.user

        if user.is_authenticated and user.role == "admin":
            return queryset

        return queryset.filter(
            is_active=True,
            product__is_active=True,
        )


class CartViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(
            customer=self.request.user,
        ).prefetch_related(
            "items",
            "items__product",
            "items__product__category",
            "items__product__brand",
            "items__product__discounts",
            "items__product__tags",
            "items__product__medias",
            "items__variant",
            "items__variant__variant_options__option__group",
        )


class CartItemViewSet(viewsets.ModelViewSet):

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__customer=self.request.user,
            cart__is_active=True,
        ).select_related(
            "cart",
            "product",
            "product__category",
            "product__brand",
            "variant",
        ).prefetch_related(
            "product__discounts",
            "product__tags",
            "product__medias",
            "variant__variant_options__option__group",
        )

    def perform_create(self, serializer):
        cart, _ = Cart.objects.get_or_create(
            customer=self.request.user,
            is_active=True,
        )
        product = serializer.validated_data["product"]
        variant = serializer.validated_data.get("variant")
        quantity = serializer.validated_data.get("quantity", 1)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={"quantity": quantity},
        )

        if created:
            serializer.instance = cart_item
            return

        next_quantity = cart_item.quantity + quantity
        if (
            variant
            and next_quantity > variant.stock
            and not StoreSettings.load().allow_out_of_stock_cart
        ):
            raise ValidationError({
                "quantity": "Quantity exceeds available stock."
            })

        cart_item.quantity = next_quantity
        cart_item.save(update_fields=["quantity", "updated_at"])
        serializer.instance = cart_item


class OrderViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateOrderSerializer

        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(
            customer=self.request.user,
        ).select_related(
            "customer",
            "address",
        ).prefetch_related(
            "items",
            "items__product__medias",
            "items__variant",
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()


class CreateKHQRView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        order = get_object_or_404(
            Order,
            id=order_id,
            customer=request.user,
            payment_method=Order.PaymentMethod.KHQR,
        )

        if order.status != Order.Status.PENDING:
            try:
                payment = order.payment
                if payment.status != PaymentTransaction.Status.PAID:
                    return Response({'error': 'Order is not pending'}, status=status.HTTP_400_BAD_REQUEST)
            except PaymentTransaction.DoesNotExist:
                return Response({'error': 'Order is not pending'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = request.data.get('refresh') is True
        qr_string, md5, qr_image_base64, qr_image_data_url = create_khqr_payment(order, refresh=refresh)

        return Response({
            'qr_string': qr_string,
            'qr_image_base64': qr_image_base64,
            'qr_image_data_url': qr_image_data_url,
            'md5': md5,
            'amount': str(order.total),
        })


class CheckKHQRView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(
            Order,
            id=order_id,
            customer=request.user,
        )

        payment_status = check_khqr_payment(order)

        return Response({
            'order_id': order.id,
            'status': payment_status,
            'order_status': (
                Order.Status.CONFIRMED
                if payment_status == 'PAID'
                else order.status
            ),
        })


class HealthCheckView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'IRCT Shop Backend',
        })
