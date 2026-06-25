"use client";

import { useMemo } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { Eye, LoaderCircle } from "lucide-react";
import DataTable from "@/components/layouts/admin/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminOrder, OrderStatus } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const statusMeta: Record<OrderStatus, { label: string; dot: string }> = {
  pending: { label: "Pending", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", dot: "bg-blue-500" },
  shipped: { label: "Shipped", dot: "bg-violet-500" },
  delivered: { label: "Delivered", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", dot: "bg-rose-500" },
};

interface OrdersTableProps {
  orders: AdminOrder[];
  isLoading: boolean;
  updatingId: number | null;
  onView: (order: AdminOrder) => void;
  onStatusChange: (id: number, status: OrderStatus) => void;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export function OrdersTable({
  orders,
  isLoading,
  updatingId,
  onView,
  onStatusChange,
  rowCount,
  paginationModel,
  onPaginationModelChange,
}: OrdersTableProps) {
  const columns = useMemo<GridColDef<AdminOrder>[]>(
    () => [
      {
        field: "id",
        headerName: "Order",
        width: 110,
        renderCell: (params: GridRenderCellParams<AdminOrder>) => (
          <div className="flex h-full flex-col justify-center py-2">
            <span className="font-semibold text-slate-900">
              #{String(params.row.id).padStart(5, "0")}
            </span>
            <span className="text-xs text-slate-400">
              {params.row.items.length} items
            </span>
          </div>
        ),
      },
      {
        field: "customer_name",
        headerName: "Customer",
        flex: 1,
        minWidth: 210,
        renderCell: (params: GridRenderCellParams<AdminOrder>) => (
          <div className="flex h-full min-w-0 flex-col justify-center py-2">
            <span className="truncate font-medium text-slate-800">
              {params.row.customer_name}
            </span>
            <span className="truncate text-xs text-slate-400">
              {params.row.customer_email}
            </span>
          </div>
        ),
      },
      {
        field: "created_at",
        headerName: "Date",
        width: 125,
        valueFormatter: (value) => new Date(value).toLocaleDateString(),
      },
      {
        field: "payment_method",
        headerName: "Payment",
        width: 155,
        renderCell: (params: GridRenderCellParams<AdminOrder>) => (
          <span className="capitalize text-slate-500">
            {params.row.payment_method.replaceAll("_", " ")}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AdminOrder>) => {
          const isUpdating = updatingId === params.row.id;
          return (
            <div className="relative flex items-center py-2">
              <Select
                value={params.row.status}
                disabled={isUpdating}
                onValueChange={(value) =>
                  onStatusChange(params.row.id, value as OrderStatus)
                }
              >
                <SelectTrigger className="h-8 w-33 rounded-lg border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-none hover:border-slate-300 hover:bg-slate-50 focus-visible:border-primary-color focus-visible:ring-2 focus-visible:ring-primary-color/15">
                  {isUpdating ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <LoaderCircle className="size-3.5 animate-spin" />{" "}
                      Updating
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${statusMeta[params.row.status].dot}`}
                      />
                      <SelectValue>
                        {statusMeta[params.row.status].label}
                      </SelectValue>
                    </span>
                  )}
                </SelectTrigger>
                <SelectContent align="start" className="min-w-37.5">
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status} className="text-xs">
                      <span className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${statusMeta[status].dot}`}
                        />
                        {statusMeta[status].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        },
      },
      {
        field: "total",
        headerName: "Total",
        width: 120,
        align: "right",
        headerAlign: "right",
        renderCell: (params: GridRenderCellParams<AdminOrder>) => (
          <span className="font-semibold text-slate-900">
            {currency.format(Number(params.row.total))}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Action",
        width: 85,
        sortable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams<AdminOrder>) => (
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-primary-color hover:bg-primary-color/10 hover:text-primary-color"
            onClick={() => onView(params.row)}
            aria-label={`View order ${params.row.id}`}
          >
            <Eye />
          </Button>
        ),
      },
    ],
    [onStatusChange, onView, updatingId],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <DataTable
        rows={orders}
        columns={columns}
        loading={isLoading}
        checkboxSelection={false}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
      />
    </div>
  );
}
