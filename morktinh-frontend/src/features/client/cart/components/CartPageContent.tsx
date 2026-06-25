"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useSelector } from "react-redux";
import ConfirmDeleteModal from "@/components/common/admin/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import {
  useClearCartMutation,
  useGetCartItemsQuery,
  useRemoveCartItemMutation,
  useUpdateCartItemMutation,
} from "@/features/client/cart/api/cartApi";
import { getImageUrl } from "@/lib/image-utils";
import { RootState } from "@/store/client/store";

function formatCurrency(value: string | number) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function CartPageContent() {
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const { isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const { data: items = [], isLoading } = useGetCartItemsQuery(undefined, {
    skip: !isHydrated || !isAuthenticated,
  });
  const [clearCart, { isLoading: isClearingCart }] = useClearCartMutation();
  const [removeCartItem, { isLoading: isRemovingItem }] = useRemoveCartItemMutation();
  const [updateCartItem, { isLoading: isUpdatingItem }] = useUpdateCartItemMutation();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce(
    (total, item) => total + Number.parseFloat(item.line_total),
    0,
  );
  const isMutating = isClearingCart || isRemovingItem || isUpdatingItem;

  const getItemImage = (item: (typeof items)[number]) => {
    const variantImage = item.variant_detail?.image;
    const productImage =
      item.product_detail.medias?.find((media) => media.is_thumbnail)?.image ||
      item.product_detail.medias?.[0]?.image;

    return getImageUrl(variantImage || productImage);
  };

  const getItemOptions = (item: (typeof items)[number]) => {
    if (!item.variant_detail?.attributes) return null;

    return Object.entries(item.variant_detail.attributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  const handleConfirmClearCart = async () => {
    await clearCart(items).unwrap();
    setClearCartOpen(false);
  };

  if (isHydrated && !isAuthenticated) {
    return (
      <main className="bg-slate-50/50 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-lg font-bold text-slate-950">
              Sign in to view your cart
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your cart is saved with your account.
            </p>
            <Button asChild className="mt-5 bg-primary-color text-white hover:bg-primary-color/90">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50/50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Cart
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          {items.length > 0 && (
            <Button
              type="button"
              variant="outline"
              disabled={isMutating}
              onClick={() => setClearCartOpen(true)}
            >
              Clear Cart
            </Button>
          )}
        </div>

        {isLoading || !isHydrated ? (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Loading cart...
          </section>
        ) : items.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Your cart is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Add products from the shop and they will appear here.
            </p>
            <Button asChild className="mt-5 bg-primary-color text-white hover:bg-primary-color/90">
              <Link href="/products">Browse Products</Link>
            </Button>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <section className="space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[96px_minmax(0,1fr)_auto]"
                >
                  {(() => {
                    const imageUrl = getItemImage(item);
                    const options = getItemOptions(item);
                    const availableStock = item.variant_detail?.stock;
                    const hasStockLimit = typeof availableStock === "number";
                    const isAtStockLimit = hasStockLimit && item.quantity >= availableStock;
                    const isOverStock = hasStockLimit && item.quantity > availableStock;

                    return (
                      <>
                  <Link
                    href={`/products/${item.product}`}
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100"
                  >
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={item.product_detail.name}
                        className="h-full w-full object-cover object-center"
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-slate-300" />
                    )}
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/products/${item.product}`}
                      className="font-bold text-slate-950 hover:text-primary-color"
                    >
                      {item.product_detail.name}
                    </Link>
                    {item.product_detail.brand_detail?.name && (
                      <p className="mt-1 text-xs font-bold uppercase text-primary-color">
                        {item.product_detail.brand_detail.name}
                      </p>
                    )}
                    {options && (
                      <p className="mt-2 text-sm text-slate-500">{options}</p>
                    )}
                    {item.variant_detail?.sku && (
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        SKU: {item.variant_detail.sku}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <div className="font-bold text-slate-950">
                        {formatCurrency(item.unit_price)}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-400">
                        {formatCurrency(item.line_total)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isMutating || item.quantity <= 1}
                        onClick={() => updateCartItem({ id: item.id, quantity: item.quantity - 1 })}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="flex h-8 min-w-9 items-center justify-center rounded border border-slate-200 px-2 text-sm font-bold">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isMutating || isAtStockLimit}
                        onClick={() => updateCartItem({ id: item.id, quantity: item.quantity + 1 })}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        disabled={isMutating}
                        onClick={() => removeCartItem(item.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {isOverStock ? (
                      <p className="max-w-52 text-right text-xs font-semibold text-red-500">
                        Only {availableStock} in stock. Please reduce quantity.
                      </p>
                    ) : isAtStockLimit ? (
                      <p className="max-w-52 text-right text-xs font-medium text-slate-500">
                        Only {availableStock} in stock.
                      </p>
                    ) : null}
                  </div>
                      </>
                    );
                  })()}
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-950">Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-950">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-semibold text-slate-400">Calculated later</span>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex justify-between gap-4 text-base">
                  <span className="font-bold text-slate-950">Total</span>
                  <span className="font-extrabold text-slate-950">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>
              <Button asChild className="mt-5 h-11 w-full bg-primary-color text-white hover:bg-primary-color/90">
                <Link href="/order">Checkout</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        open={clearCartOpen}
        onClose={() => setClearCartOpen(false)}
        onConfirm={handleConfirmClearCart}
        title="Clear cart?"
        description={`Remove all ${itemCount} ${itemCount === 1 ? "item" : "items"} from your cart?`}
        isLoading={isClearingCart}
      />
    </main>
  );
}
