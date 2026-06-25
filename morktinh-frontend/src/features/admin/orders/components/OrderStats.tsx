import {
  CircleDollarSign,
  Clock3,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";
import { OrderSummary } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function OrderStats({ summary }: { summary: OrderSummary }) {
  const stats = [
    {
      label: "Total orders",
      value: summary.orders.toString(),
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: summary.pending.toString(),
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Delivered",
      value: summary.delivered.toString(),
      icon: PackageCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Order value",
      value: currency.format(Number(summary.order_value)),
      icon: CircleDollarSign,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <article
          key={label}
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${color}`}
          >
            <Icon className="size-5" />
          </div>
        </article>
      ))}
    </section>
  );
}
