"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateKHQRPaymentMutation,
  useGetKHQRPaymentStatusQuery,
} from "@/features/client/order/api/orderApi";
import { getCheckoutErrorMessage } from "@/features/client/order/utils/checkout";

interface KHQRPaymentPanelProps {
  orderId: number;
}

export function KHQRPaymentPanel({ orderId }: KHQRPaymentPanelProps) {
  const router = useRouter();
  const hasRequestedPayment = useRef(false);
  const [isOpen, setIsOpen] = useState(true);
  const [createPayment, { data: payment, error: paymentError, isLoading }] =
    useCreateKHQRPaymentMutation();
  const { data: paymentStatus, isFetching } = useGetKHQRPaymentStatusQuery(orderId, {
    pollingInterval: payment ? 3000 : 0,
    skip: !payment,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (hasRequestedPayment.current) {
      return;
    }

    hasRequestedPayment.current = true;
    createPayment({ orderId });
  }, [createPayment, orderId]);

  useEffect(() => {
    if (paymentStatus?.status === "PAID") {
      router.push("/orders");
    }
  }, [paymentStatus?.status, router]);

  const qrDataUrl =
    payment?.qr_image_data_url ||
    (payment?.qr_image_base64 ? `data:image/png;base64,${payment.qr_image_base64}` : "");
  const errorMessage = paymentError ? getCheckoutErrorMessage(paymentError) : "";
  const isPaid = paymentStatus?.status === "PAID";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-11 w-full gap-2 bg-primary-color text-white hover:bg-primary-color/90 md:w-56"
        >
          <QrCode className="h-4 w-4" />
          Open KHQR payment
        </Button>
      )}

      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-85 overflow-y-auto p-2 md:max-w-3xl md:p-5">
        <DialogHeader className="sr-only md:not-sr-only md:flex-row md:items-start md:justify-between md:pr-8">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-950">
              <QrCode className="h-5 w-5 text-primary-color" />
              Pay with KHQR
            </DialogTitle>
            <DialogDescription className="mt-2">
              Complete payment for Order #{orderId} with your banking app.
            </DialogDescription>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
            isPaid
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}>
            {isPaid ? "Paid" : "Pending"}
          </span>
        </DialogHeader>

        <div className="grid items-center gap-6 md:grid-cols-[minmax(240px,300px)_1fr]">
          <div className="flex max-h-[calc(100dvh-4rem)] items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1 md:max-h-none md:min-h-97.5 md:p-3">
          {isLoading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-primary-color" />
              Creating KHQR...
            </div>
          ) : qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt="KHQR payment code"
              className="max-h-[calc(100dvh-5rem)] w-auto max-w-full rounded-[16px] bg-white object-contain md:max-h-97.5 md:rounded-[20px] md:shadow-[0_14px_35px_rgba(15,23,42,0.12)]"
            />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-sm font-semibold text-red-600">
              <QrCode className="h-10 w-10 opacity-40" />
              {errorMessage || "KHQR is not available."}
            </div>
          )}
          </div>

          <div className="hidden md:block">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-color">
              How to pay
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">Three quick steps</h3>

            <ol className="mt-7 space-y-6">
              {[
                ["1", "Open your banking app", "Choose its Scan or KHQR payment option."],
                ["2", "Scan this QR code", "Point your phone camera at the code shown here."],
                ["3", "Review and confirm", "Check the recipient and amount, then approve payment."],
              ].map(([number, title, description]) => (
                <li key={number} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-color font-bold text-white">
                    {number}
                  </span>
                  <div>
                    <p className="font-bold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className={`mt-8 flex items-center gap-3 rounded-lg p-4 ${
              isPaid ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-700"
            }`}>
              {isPaid ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <Loader2 className={`h-5 w-5 shrink-0 text-primary-color ${isFetching ? "animate-spin" : ""}`} />
              )}
              <div>
                <p className="font-bold">{isPaid ? "Payment received" : "Waiting for payment"}</p>
                <p className="mt-0.5 text-xs">
                  {isPaid ? "Opening your orders..." : "Payment status updates automatically."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
