"use client";

import { useEffect, useState } from "react";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layouts/admin/top-header";
import { Input } from "@/components/ui/input";
import {
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} from "../api/ordersApi";
import { AdminOrder, OrderStatus, PaymentMethod } from "../types";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { OrderStats } from "./OrderStats";
import { OrdersTable } from "./OrdersTable";
import { CreateOrderDialog } from "./CreateOrderDialog";

export function OrdersPageContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");
  const [paymentMethod, setPaymentMethod] = useState<"all" | PaymentMethod>(
    "all",
  );
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const { data, isLoading, isFetching } = useGetAdminOrdersQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
  });
  const [updateStatus] = useUpdateAdminOrderStatusMutation();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPaginationModel((current) => ({ ...current, page: 0 }));
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const handleStatusChange = async (id: number, nextStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      await updateStatus({ id, status: nextStatus }).unwrap();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/70">
      <TopHeader title="Order Management" />
      <main className="mx-auto flex w-full max-w-375 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review purchases, track fulfillment, and update order status.
          </p>
          </div>
          <Button className="bg-primary-color text-white hover:bg-primary-color/90" onClick={() => setCreateOpen(true)}><Plus /> Create order</Button>
        </div>
        <OrderStats
          summary={
            data?.summary ?? {
              orders: 0,
              pending: 0,
              delivered: 0,
              order_value: "0",
            }
          }
        />
        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, customer, email, or phone..."
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | OrderStatus);
              setPaginationModel((current) => ({ ...current, page: 0 }));
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-primary-color"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={paymentMethod}
            onChange={(event) => {
              setPaymentMethod(event.target.value as "all" | PaymentMethod);
              setPaginationModel((current) => ({ ...current, page: 0 }));
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-primary-color"
          >
            <option value="all">All payments</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="khqr">KHQR</option>
          </select>
          <span className="text-xs font-medium text-slate-400">
            {data?.count ?? 0} results
          </span>
        </section>
        <OrdersTable
          orders={data?.results ?? []}
          isLoading={isLoading || isFetching}
          updatingId={updatingId}
          onView={setSelectedOrder}
          onStatusChange={handleStatusChange}
          rowCount={data?.count ?? 0}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </main>
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
      <CreateOrderDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
