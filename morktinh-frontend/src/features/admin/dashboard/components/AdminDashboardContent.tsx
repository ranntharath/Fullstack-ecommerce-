"use client";

import { RefreshCw } from "lucide-react";
import { TopHeader } from "@/components/layouts/admin/top-header";
import { Button } from "@/components/ui/button";
import { useGetAdminDashboardQuery } from "../api/dashboardApi";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardStats } from "./DashboardStats";
import { LowStockInventory } from "./LowStockInventory";
import { OrderStatusOverview } from "./OrderStatusOverview";
import { RecentOrders } from "./RecentOrders";
import { SalesPerformance } from "./SalesPerformance";

export function AdminDashboardContent() {
  const { data, isLoading, isError, refetch, isFetching } = useGetAdminDashboardQuery();

  return (
    <>
      <TopHeader title="Dashboard">
        <Button variant="outline" size="sm" className="h-10" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? "animate-spin" : ""} /> Refresh
        </Button>
      </TopHeader>
      <main className="flex flex-1 flex-col gap-6 bg-slate-50/80 p-4 lg:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-medium text-primary-color">Store overview</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Good to see you again.</h1><p className="mt-1 text-sm text-slate-500">Here&apos;s what&apos;s happening with your store today.</p></div>
          <p className="text-xs font-medium text-slate-400">{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p>
        </div>
        {isLoading ? <DashboardSkeleton /> : isError || !data ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-800">Dashboard data couldn&apos;t be loaded</p><p className="mt-1 text-sm text-slate-500">Check the backend connection and try again.</p><Button className="mt-4 bg-primary-color hover:bg-primary-color/90" onClick={() => refetch()}>Try again</Button></div>
        ) : (
          <>
            <DashboardStats summary={data.summary} />
            <LowStockInventory items={data.low_stock_items} totalCount={data.summary.low_stock_count} threshold={data.summary.low_stock_threshold} />
            <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]"><SalesPerformance points={data.sales_trend} /><OrderStatusOverview statuses={data.order_statuses} /></section>
            <RecentOrders orders={data.recent_orders} />
          </>
        )}
      </main>
    </>
  );
}
