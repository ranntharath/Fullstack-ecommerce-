"use client";

import { AlertTriangle, Megaphone } from "lucide-react";
import { useGetPublicSettingsQuery } from "../api/settingsApi";

export function StoreStatusBar() {
  const { data: settings } = useGetPublicSettingsQuery();

  if (!settings?.maintenance_mode && !settings?.announcement_text) {
    return null;
  }

  return (
    <div className={`border-b px-4 py-2 text-sm font-semibold ${settings.maintenance_mode ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-100 bg-blue-50 text-primary-color"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center">
        {settings.maintenance_mode ? (
          <AlertTriangle className="h-4 w-4 shrink-0" />
        ) : (
          <Megaphone className="h-4 w-4 shrink-0" />
        )}
        <span>
          {settings.maintenance_mode
            ? "Maintenance mode is active. Some checkout features may be unavailable."
            : settings.announcement_text}
        </span>
      </div>
    </div>
  );
}
