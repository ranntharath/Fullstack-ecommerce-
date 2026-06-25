from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminDashboardView,
    AdminOrderViewSet,
    AdminStoreSettingsTestAlertView,
    AdminStoreSettingsView,
    BannerViewSet,
    BrandViewSet,
    CartViewSet,
    CartItemViewSet,
    CategoryViewSet,
    DiscountViewSet,
    OrderViewSet,
    ProductFreeItemViewSet,
    ProductMediaViewSet,
    ProductOptionGroupViewSet,
    ProductOptionViewSet,
    ProductTagViewSet,
    ProductVariantViewSet,
    ProductVideoViewSet,
    ProductViewSet,
    PublicStoreSettingsView,
    VariantOptionViewSet,
    CreateKHQRView,
    CheckKHQRView,
)


router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('brands', BrandViewSet, basename='brand')
router.register('banners', BannerViewSet, basename='banner')
router.register('discounts', DiscountViewSet, basename='discount')
router.register('tags', ProductTagViewSet, basename='product-tag')
router.register('products', ProductViewSet, basename='product')
router.register('product-medias', ProductMediaViewSet, basename='product-media')
router.register('product-videos', ProductVideoViewSet, basename='product-video')
router.register('option-groups', ProductOptionGroupViewSet, basename='option-group')
router.register('options', ProductOptionViewSet, basename='option')
router.register('variants', ProductVariantViewSet, basename='variant')
router.register('variant-options', VariantOptionViewSet, basename='variant-option')
router.register('free-items', ProductFreeItemViewSet, basename='free-item')
router.register('carts', CartViewSet, basename='cart')
router.register('cart-items', CartItemViewSet, basename='cart-item')
router.register('orders', OrderViewSet, basename='order')
router.register('admin/orders', AdminOrderViewSet, basename='admin-order')


urlpatterns = [
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/settings/', AdminStoreSettingsView.as_view(), name='admin-settings'),
    path('admin/settings/test-alert/', AdminStoreSettingsTestAlertView.as_view(), name='admin-settings-test-alert'),
    path('settings/', PublicStoreSettingsView.as_view(), name='public-settings'),
    path('', include(router.urls)),
    path('khqr/<int:order_id>/', CreateKHQRView.as_view(), name='create_khqr'),
    path('khqr/<int:order_id>/status/', CheckKHQRView.as_view(), name='check_khqr'),
]
