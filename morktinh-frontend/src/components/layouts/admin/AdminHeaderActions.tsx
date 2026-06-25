"use client";

import { useSelector } from "react-redux";
import { useGetAdminDashboardQuery } from "@/features/admin/dashboard/api/dashboardApi";
import { DashboardNotifications } from "@/features/admin/dashboard/components/DashboardNotifications";
import type { RootState } from "@/store/admin/store";

export function AdminHeaderActions() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data } = useGetAdminDashboardQuery();
  const displayName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.email ||
    "Admin User";
  const initials =
    `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "AD";

  return (
    <div className="flex items-center gap-3">
      <DashboardNotifications data={data} />
      <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {initials}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="max-w-36 truncate text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="max-w-36 truncate text-xs text-slate-400">
            {user?.email || "Admin"}
          </p>
        </div>
      </div>
    </div>
  );
}
