"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { useGetCartItemsQuery } from "@/features/client/cart/api/cartApi";
import { CheckoutAddressSection } from "@/features/client/order/components/CheckoutAddressSection";
import { CheckoutOrderInfoSection } from "@/features/client/order/components/CheckoutOrderInfoSection";
import { CheckoutSummary } from "@/features/client/order/components/CheckoutSummary";
import { KHQRPaymentPanel } from "@/features/client/order/components/KHQRPaymentPanel";
import { useCreateOrderMutation } from "@/features/client/order/api/orderApi";
import { PaymentMethod } from "@/features/client/order/types";
import {
  emptyAddress,
  getCheckoutErrorMessage,
} from "@/features/client/order/utils/checkout";
import { CustomerAddressRequest } from "@/features/client/profile/types";
import { useGetAddressesQuery } from "@/features/client/profile/api/profileApi";
import { RootState } from "@/store/client/store";

export function CheckoutPageContent() {
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<CustomerAddressRequest>(emptyAddress);
  const [saveAddress, setSaveAddress] = useState(true);
  const [contactEmail, setContactEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [notes, setNotes] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [createdOrderPaymentMethod, setCreatedOrderPaymentMethod] = useState<PaymentMethod | null>(null);
  const { isAuthenticated, isHydrated } = useSelector((state: RootState) => state.auth);
  const { data: items = [], isLoading: isLoadingCart } = useGetCartItemsQuery(undefined, {
    skip: !isHydrated || !isAuthenticated,
  });
  const { data: addresses = [], isLoading: isLoadingAddresses } = useGetAddressesQuery(undefined, {
    skip: !isHydrated || !isAuthenticated,
  });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const subtotal = items.reduce(
    (total, item) => total + Number.parseFloat(item.line_total),
    0,
  );
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const hasSavedAddresses = addresses.length > 0;
  const effectiveAddressMode = hasSavedAddresses ? addressMode : "new";
  const effectiveSelectedAddressId = selectedAddressId ?? addresses[0]?.id ?? null;

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError("");
    setCreatedOrderId(null);
    setCreatedOrderPaymentMethod(null);

    if (effectiveAddressMode === "saved" && !effectiveSelectedAddressId) {
      setCheckoutError("Choose a delivery address.");
      return;
    }

    try {
      const order = await createOrder({
        ...(effectiveAddressMode === "saved"
          ? { address_id: effectiveSelectedAddressId as number }
          : { new_address: newAddress, save_address: saveAddress }),
        contact_email: contactEmail || undefined,
        notes,
        payment_method: paymentMethod,
      }).unwrap();

      setCreatedOrderId(order.id);
      setCreatedOrderPaymentMethod(order.payment_method);
      setNewAddress(emptyAddress);
      setNotes("");
    } catch (error) {
      setCheckoutError(getCheckoutErrorMessage(error));
    }
  };

  if (isHydrated && !isAuthenticated) {
    return (
      <main className="bg-slate-50/50 pb-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-lg font-bold text-slate-950">Sign in to checkout</h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Your cart and addresses are saved with your account.
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
              Order
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Confirm delivery details and place your order.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/cart">Back to Cart</Link>
          </Button>
        </div>

        {isLoadingCart || !isHydrated ? (
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Loading order...
          </section>
        ) : items.length === 0 && !createdOrderId ? (
          <section className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-950">Your cart is empty</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Add products before creating an order.
            </p>
            <Button asChild className="mt-5 bg-primary-color text-white hover:bg-primary-color/90">
              <Link href="/products">Browse Products</Link>
            </Button>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <form onSubmit={handleCreateOrder} className="space-y-5">
              <CheckoutAddressSection
                addresses={addresses}
                effectiveAddressMode={effectiveAddressMode}
                effectiveSelectedAddressId={effectiveSelectedAddressId}
                isCreatingOrder={isCreatingOrder}
                isLoadingAddresses={isLoadingAddresses}
                newAddress={newAddress}
                saveAddress={saveAddress}
                setAddressMode={setAddressMode}
                setNewAddress={setNewAddress}
                setSaveAddress={setSaveAddress}
                setSelectedAddressId={setSelectedAddressId}
              />

              <CheckoutOrderInfoSection
                contactEmail={contactEmail}
                isCreatingOrder={isCreatingOrder}
                notes={notes}
                paymentMethod={paymentMethod}
                setContactEmail={setContactEmail}
                setNotes={setNotes}
                setPaymentMethod={setPaymentMethod}
              />

              {checkoutError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {checkoutError}
                </div>
              )}

              {createdOrderId && createdOrderPaymentMethod !== "khqr" && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4" />
                    Order #{createdOrderId} placed
                  </div>
                  <p className="mt-1 leading-6">Your order was created and the cart was cleared.</p>
                </div>
              )}

              {createdOrderId && createdOrderPaymentMethod === "khqr" && (
                <KHQRPaymentPanel orderId={createdOrderId} />
              )}

              {!createdOrderId && (
                <Button
                  type="submit"
                  disabled={isCreatingOrder || isLoadingAddresses || itemCount === 0}
                  className="h-11 w-full bg-primary-color text-white hover:bg-primary-color/90 md:w-56"
                >
                  {isCreatingOrder
                    ? "Placing order..."
                    : paymentMethod === "khqr"
                      ? "Place Order & Pay KHQR"
                      : "Place Order"}
                </Button>
              )}
            </form>

            <CheckoutSummary items={items} subtotal={subtotal} />
          </div>
        )}
      </div>
    </main>
  );
}
