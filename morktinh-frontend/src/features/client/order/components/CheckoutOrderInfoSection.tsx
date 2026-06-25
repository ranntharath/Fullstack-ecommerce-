import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethod } from "@/features/client/order/types";

interface CheckoutOrderInfoSectionProps {
  contactEmail: string;
  isCreatingOrder: boolean;
  notes: string;
  paymentMethod: PaymentMethod;
  setContactEmail: (email: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
}

export function CheckoutOrderInfoSection({
  contactEmail,
  isCreatingOrder,
  notes,
  paymentMethod,
  setContactEmail,
  setNotes,
  setPaymentMethod,
}: CheckoutOrderInfoSectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary-color" />
        <h2 className="text-lg font-bold text-slate-950">Order Info</h2>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="order-email">Contact email</Label>
          <Input
            id="order-email"
            type="email"
            disabled={isCreatingOrder}
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Use account email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-payment">Payment method</Label>
          <select
            id="order-payment"
            disabled={isCreatingOrder}
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-primary-color disabled:bg-slate-50"
          >
            <option value="cash_on_delivery">Cash on delivery</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="khqr">KHQR</option>
          </select>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="order-notes">Order notes</Label>
        <Textarea
          id="order-notes"
          disabled={isCreatingOrder}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Delivery notes"
        />
      </div>
    </section>
  );
}
