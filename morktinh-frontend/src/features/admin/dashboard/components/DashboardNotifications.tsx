"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, PackageCheck, PackageX, ShoppingBag } from "lucide-react";
import { DashboardData } from "../types";

export function DashboardNotifications({ data }: { data?: DashboardData }) {
  const [open, setOpen] = useState(false);
  const showOrderAlerts = Boolean(data?.summary.order_alerts_enabled);
  const pendingOrderAlertCount = showOrderAlerts && data?.summary.pending_orders ? 1 : 0;
  const count = data ? pendingOrderAlertCount + data.low_stock_items.length : 0;

  return (
    <div className="relative">
      <button type="button" aria-label="Open notifications" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900">
        <Bell className="size-4.5" />
        {count > 0 && <span className="absolute -right-1.5 -top-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-4.5 text-white ring-2 ring-white">{count > 99 ? "99+" : count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div><p className="text-sm font-semibold text-slate-900">Notifications</p><p className="text-[11px] text-slate-400">Inventory and order alerts</p></div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{count} {count === 1 ? "alert" : "alerts"}</span>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {showOrderAlerts && !!data?.summary.pending_orders && (
              <Link href="/admin/orders" onClick={() => setOpen(false)} className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><ShoppingBag className="size-4" /></div>
                <div><p className="text-sm font-semibold text-slate-800">Orders need attention</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{data.summary.pending_orders} pending {data.summary.pending_orders === 1 ? "order is" : "orders are"} waiting for review.</p></div>
              </Link>
            )}
            {data?.low_stock_items.map((item) => (
              <Link key={item.id} href={`/admin/products/edit/${item.product_id}`} onClick={() => setOpen(false)} className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${item.stock === 0 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}><PackageX className="size-4" /></div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.product_name}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{item.stock === 0 ? "Out of stock" : `Only ${item.stock} left`} · SKU {item.sku}</p></div>
              </Link>
            ))}
            {!pendingOrderAlertCount && !data?.low_stock_items.length && (
              <div className="px-4 py-8 text-center"><PackageCheck className="mx-auto size-7 text-emerald-500" /><p className="mt-2 text-sm font-semibold text-slate-700">You&apos;re all caught up</p><p className="mt-1 text-xs text-slate-400">There are no alerts right now.</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
