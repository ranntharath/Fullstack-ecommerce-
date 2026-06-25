import Link from "next/link";
import { Clock3 } from "lucide-react";
import { OrderStatus, RecentOrder } from "../types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const statusStyles: Record<OrderStatus, string> = { pending: "bg-amber-50 text-amber-700 ring-amber-200", confirmed: "bg-blue-50 text-blue-700 ring-blue-200", shipped: "bg-violet-50 text-violet-700 ring-violet-200", delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200", cancelled: "bg-rose-50 text-rose-700 ring-rose-200" };

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-slate-900">Recent orders</h2><p className="mt-1 text-xs text-slate-400">The latest activity across your store</p></div><Link href="/admin/orders" className="text-xs font-semibold text-primary-color hover:underline">View all orders</Link></div>
      {orders.length ? (
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3 font-semibold">Order</th><th className="px-6 py-3 font-semibold">Customer</th><th className="px-6 py-3 font-semibold">Date</th><th className="px-6 py-3 font-semibold">Status</th><th className="px-6 py-3 text-right font-semibold">Total</th></tr></thead><tbody className="divide-y divide-slate-100">{orders.map((order) => (
          <tr key={order.id} className="transition-colors hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-slate-900">#{String(order.id).padStart(5, "0")}</td><td className="px-6 py-4"><p className="font-medium text-slate-800">{order.customer}</p><p className="mt-0.5 text-xs text-slate-400">{order.email}</p></td><td className="px-6 py-4 text-slate-500">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(order.created_at))}</td><td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${statusStyles[order.status]}`}>{order.status}</span></td><td className="px-6 py-4 text-right font-semibold text-slate-900">{currency.format(Number(order.total))}</td></tr>
        ))}</tbody></table></div>
      ) : <div className="flex flex-col items-center py-14 text-center"><Clock3 className="size-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-600">No orders yet</p><p className="mt-1 text-xs text-slate-400">New orders will appear here.</p></div>}
    </section>
  );
}
