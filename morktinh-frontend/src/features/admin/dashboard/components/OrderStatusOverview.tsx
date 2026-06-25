import { PackageCheck } from "lucide-react";
import { OrderStatus, OrderStatusSummary } from "../types";

const statusBars: Record<OrderStatus, string> = { pending: "bg-amber-400", confirmed: "bg-blue-500", shipped: "bg-violet-500", delivered: "bg-emerald-500", cancelled: "bg-rose-400" };

export function OrderStatusOverview({ statuses }: { statuses: OrderStatusSummary[] }) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">Order status</h2><p className="mt-1 text-xs text-slate-400">All-time fulfillment overview</p></div><PackageCheck className="size-5 text-slate-400" /></div>
      <div className="mt-6 space-y-4">
        {statuses.map((item) => {
          const percentage = total ? Math.round((item.count / total) * 100) : 0;
          return <div key={item.status}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">{item.label}</span><span className="font-semibold text-slate-900">{item.count} <span className="font-normal text-slate-400">({percentage}%)</span></span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${statusBars[item.status]}`} style={{ width: `${percentage}%` }} /></div></div>;
        })}
      </div>
    </article>
  );
}
