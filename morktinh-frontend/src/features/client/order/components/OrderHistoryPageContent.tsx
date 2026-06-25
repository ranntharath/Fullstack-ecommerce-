"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Package, ShoppingBag } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useGetOrdersQuery } from "@/features/client/order/api/orderApi";
import { Order } from "@/features/client/order/types";
import { getImageUrl } from "@/lib/image-utils";
import { RootState } from "@/store/client/store";

function formatCurrency(value: string | number) {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClassName(status: string) {
  if (status === "cancelled") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "shipped" || status === "confirmed") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getItemOptions(item: Order["items"][number]) {
  if (!item.variant_attributes) return null;

  return Object.entries(item.variant_attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
}

export function OrderHistoryPageContent() {
  const { isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const { data: orders = [], isLoading } = useGetOrdersQuery(undefined, {
    skip: !isHydrated || !isAuthenticated,
  });

  if (isHydrated && !isAuthenticated) {
    return (
      <main className="bg-slate-50/50 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <Package className="h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-lg font-bold text-slate-950">Sign in to view orders</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your order history is saved with your account.
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
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Order History
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your previous orders and delivery details.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {isLoading || !isHydrated ? (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Loading orders...
          </section>
        ) : orders.length === 0 ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">No orders yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Orders you place will show up here.
            </p>
            <Button asChild className="mt-5 bg-primary-color text-white hover:bg-primary-color/90">
              <Link href="/products">Browse Products</Link>
            </Button>
          </section>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-950">Order #{order.id}</h2>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusClassName(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">{order.items.length} items</div>
                    <div className="mt-1 text-xl font-extrabold text-slate-950">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-100">
                    {order.items.map((item) => {
                      const options = getItemOptions(item);
                      const imageUrl = getImageUrl(item.product_image);

                      return (
                        <div key={item.id} className="flex gap-4 p-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                            {imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={imageUrl}
                                alt={item.product_name}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-950">{item.product_name}</div>
                            {options && (
                              <div className="mt-1 text-sm text-slate-500">{options}</div>
                            )}
                            {item.variant_sku && (
                              <div className="mt-1 text-xs font-semibold text-slate-400">
                                SKU: {item.variant_sku}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-bold text-slate-950">{formatCurrency(item.line_total)}</div>
                            <div className="mt-1 text-slate-500">
                              {item.quantity} x {formatCurrency(item.unit_price)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-slate-100 p-4">
                    <div className="flex items-center gap-2 font-bold text-slate-950">
                      <MapPin className="h-4 w-4 text-primary-color" />
                      Delivery
                    </div>
                    <div className="mt-3 text-sm leading-6 text-slate-700">
                      <div className="font-bold text-slate-950">{order.recipient_name}</div>
                      <div className="text-slate-500">{order.phone}</div>
                      <div className="mt-2">
                        {order.address_line1}
                        {order.address_line2 ? `, ${order.address_line2}` : ""}
                        <br />
                        {order.commune}, {order.district}, {order.city}
                      </div>
                      {order.notes && (
                        <div className="mt-3 rounded-md bg-slate-50 p-3 text-slate-600">
                          {order.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
