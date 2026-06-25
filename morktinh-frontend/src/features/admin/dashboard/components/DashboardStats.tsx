import { ArrowDownRight, ArrowUpRight, Box, CircleDollarSign, ShoppingBag, Users } from "lucide-react";
import { DashboardSummary } from "../types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const compactNumber = new Intl.NumberFormat("en-US", { notation: "compact" });

function StatCard({ title, value, detail, change, icon: Icon, iconClass }: {
  title: string;
  value: string;
  detail: string;
  change?: number;
  icon: typeof CircleDollarSign;
  iconClass: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p></div>
        <div className={`flex size-11 items-center justify-center rounded-xl ${iconClass}`}><Icon className="size-5" /></div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {change !== undefined && (
          <span className={`flex items-center font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
            {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(change)}%
          </span>
        )}
        <span className="text-slate-400">{detail}</span>
      </div>
    </article>
  );
}

export function DashboardStats({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="Total revenue" value={currency.format(Number(summary.revenue))} detail="vs previous 30 days" change={summary.revenue_change} icon={CircleDollarSign} iconClass="bg-emerald-50 text-emerald-600" />
      <StatCard title="Total orders" value={compactNumber.format(summary.orders)} detail="vs previous 30 days" change={summary.orders_change} icon={ShoppingBag} iconClass="bg-blue-50 text-blue-600" />
      <StatCard title="Customers" value={compactNumber.format(summary.customers)} detail="registered accounts" icon={Users} iconClass="bg-violet-50 text-violet-600" />
      <StatCard title="Products" value={compactNumber.format(summary.products)} detail={`${summary.low_stock_count} variants low in stock`} icon={Box} iconClass="bg-amber-50 text-amber-600" />
    </section>
  );
}
