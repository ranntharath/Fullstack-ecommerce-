"use client";

import { useEffect, useMemo, useState } from "react";
import type { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { FilterX, Pencil, Search, Trash2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/common/admin/ConfirmDeleteModal";
import DataTable from "@/components/layouts/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteCustomerMutation, useGetCustomersPageQuery } from "../api/customersApi";
import type { CustomerListParams, CustomerPageParams } from "../api/customersApi";
import type { AdminCustomer } from "../types";
import { CustomerFormDialog } from "./CustomerFormDialog";

type AccountFilter = "all" | "active" | "inactive";
type VerificationFilter = "all" | "verified" | "unverified";

export function CustomersTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<AccountFilter>("all");
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [editing, setEditing] = useState<AdminCustomer | null>(null);
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null);
  const [deleteCustomer, deleteState] = useDeleteCustomerMutation();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPaginationModel((current) => ({ ...current, page: 0 }));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const queryParams = useMemo<CustomerPageParams>(() => {
    const params: CustomerListParams = {};

    if (debouncedSearch) params.search = debouncedSearch;
    if (accountFilter !== "all") params.is_active = accountFilter === "active";
    if (verificationFilter !== "all") {
      params.is_email_verified = verificationFilter === "verified";
    }

    return {
      ...params,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    };
  }, [accountFilter, debouncedSearch, paginationModel.page, paginationModel.pageSize, verificationFilter]);

  const { data: customersPage, isLoading, isFetching } = useGetCustomersPageQuery(queryParams);

  const columns = useMemo<GridColDef<AdminCustomer>[]>(() => [
    {
      field: "customer",
      headerName: "Customer",
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const name = `${row.first_name} ${row.last_name}`.trim();
        const initials = `${row.first_name[0] ?? ""}${row.last_name[0] ?? ""}`.toUpperCase() || row.email[0].toUpperCase();
        return <div className="flex h-full min-w-0 items-center gap-3 py-2"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-xs font-bold text-primary-color">{initials}</div><div className="min-w-0"><p className="truncate font-medium text-slate-900">{name || "Unnamed customer"}</p><p className="truncate text-xs text-slate-400">{row.email}</p></div></div>;
      },
    },
    { field: "phone", headerName: "Phone", minWidth: 145, flex: 0.6, valueFormatter: (value) => value || "—" },
    {
      field: "is_email_verified",
      headerName: "Verification",
      width: 130,
      renderCell: ({ value }) => <Badge active={Boolean(value)} activeLabel="Verified" inactiveLabel="Unverified" />,
    },
    {
      field: "is_active",
      headerName: "Account",
      width: 115,
      renderCell: ({ value }) => <Badge active={Boolean(value)} activeLabel="Active" inactiveLabel="Inactive" />,
    },
    {
      field: "last_login",
      headerName: "Last login",
      width: 145,
      valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "Never",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 110,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => <div className="flex gap-1"><Button variant="ghost" size="icon-sm" className="text-primary-color hover:bg-primary-color/10 hover:text-primary-color" onClick={() => setEditing(row)} aria-label={`Edit ${row.email}`}><Pencil /></Button><Button variant="ghost" size="icon-sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(row)} aria-label={`Delete ${row.email}`}><Trash2 /></Button></div>,
    },
  ], []);

  const hasFilters = Boolean(search.trim()) || accountFilter !== "all" || verificationFilter !== "all";
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAccountFilter("all");
    setVerificationFilter("all");
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    await deleteCustomer(deleting.id).unwrap();
    setDeleting(null);
  };

  return <div className="space-y-4">
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-60 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone..." className="pl-9" /></div>
      <FilterSelect value={accountFilter} onChange={(value) => { setAccountFilter(value as AccountFilter); setPaginationModel((current) => ({ ...current, page: 0 })); }} options={[['all', 'All accounts'], ['active', 'Active'], ['inactive', 'Inactive']]} />
      <FilterSelect value={verificationFilter} onChange={(value) => { setVerificationFilter(value as VerificationFilter); setPaginationModel((current) => ({ ...current, page: 0 })); }} options={[['all', 'All verification'], ['verified', 'Verified'], ['unverified', 'Unverified']]} />
      <Button variant="outline" onClick={clearFilters} disabled={!hasFilters}><FilterX /> Reset</Button>
      <span className="whitespace-nowrap text-xs font-medium text-slate-400">{customersPage?.count ?? 0} customers</span>
    </section>

    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><DataTable rows={customersPage?.results ?? []} columns={columns as GridColDef[]} loading={isLoading || isFetching} checkboxSelection={false} paginationMode="server" rowCount={customersPage?.count ?? 0} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} /></div>
    <CustomerFormDialog customer={editing} open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)} />
    <ConfirmDeleteModal open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => void confirmDelete()} isLoading={deleteState.isLoading} title="Delete customer" description={<>Delete <strong>{deleting?.email}</strong>? Their linked addresses, carts, and orders may also be removed. This cannot be undone.</>} />
  </div>;
}

function Badge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${active ? "bg-primary-color/10 text-primary-color" : "bg-slate-100 text-slate-500"}`}>{active ? activeLabel : inactiveLabel}</span>;
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-primary-color">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select>;
}
