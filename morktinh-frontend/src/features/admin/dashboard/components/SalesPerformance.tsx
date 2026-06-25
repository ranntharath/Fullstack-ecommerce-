import type { CSSProperties } from "react";
import { SalesTrendPoint } from "../types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function SalesPerformance({ points }: { points: SalesTrendPoint[] }) {
  const maxRevenue = Math.max(...points.map((point) => Number(point.revenue)), 1);
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">Sales performance</h2><p className="mt-1 text-xs text-slate-400">Revenue over the last 7 days</p></div><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">Last 7 days</span></div>
      <div className="mt-8 flex h-52 items-end gap-2 sm:gap-4">
        {points.map((point) => {
          const amount = Number(point.revenue);
          const height = amount ? Math.max((amount / maxRevenue) * 100, 8) : 3;
          return (
            <div key={point.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div className="relative flex h-full w-full items-end justify-center">
                <span className="absolute bottom-[calc(var(--bar-height)+8px)] hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white group-hover:block" style={{ "--bar-height": `${height}%` } as CSSProperties}>{currency.format(amount)}</span>
                <div className="w-full max-w-12 rounded-t-md bg-primary-color/90 transition-all duration-500 group-hover:bg-primary-color" style={{ height: `${height}%` }} />
              </div>
              <span className="text-[11px] font-medium text-slate-400">{new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(`${point.date}T00:00:00`))}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
