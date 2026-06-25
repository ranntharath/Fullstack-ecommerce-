import { ShoppingBag } from "lucide-react";
import { CartItem } from "@/features/client/cart/types";
import {
  formatCurrency,
  getCartItemImage,
} from "@/features/client/order/utils/checkout";

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
}

export function CheckoutSummary({ items, subtotal }: CheckoutSummaryProps) {
  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-950">Items</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const imageUrl = getCartItemImage(item);

          return (
            <div key={item.id} className="flex gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={item.product_detail.name}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <ShoppingBag className="h-5 w-5 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-slate-950">
                  {item.product_detail.name}
                </div>
                <div className="mt-1 text-xs text-slate-500">Qty {item.quantity}</div>
              </div>
              <div className="text-sm font-bold text-slate-950">
                {formatCurrency(item.line_total)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-950">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Shipping</span>
          <span className="font-semibold text-slate-400">Calculated later</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-slate-100 pt-3 text-base">
          <span className="font-bold text-slate-950">Total</span>
          <span className="font-extrabold text-slate-950">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </aside>
  );
}
