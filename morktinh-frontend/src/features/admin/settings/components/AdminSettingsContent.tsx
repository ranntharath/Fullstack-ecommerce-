"use client";

import { useState } from "react";
import {
  Bell,
  CreditCard,
  Megaphone,
  Package,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { useSelector } from "react-redux";
import { TopHeader } from "@/components/layouts/admin/top-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { RootState } from "@/store/admin/store";
import {
  useGetAdminSettingsQuery,
  useSendTestAlertMutation,
  useUpdateAdminSettingsMutation,
} from "../api/settingsApi";
import type { AdminStoreSettings } from "../types";

type SettingsDraft = Omit<AdminStoreSettings, "updated_at">;

function toDraft(settings: AdminStoreSettings): SettingsDraft {
  return {
    store_name: settings.store_name,
    support_email: settings.support_email,
    alert_email: settings.alert_email,
    support_phone: settings.support_phone || "",
    currency_code: settings.currency_code,
    default_shipping_fee: settings.default_shipping_fee,
    low_stock_threshold: settings.low_stock_threshold,
    email_alerts_enabled: settings.email_alerts_enabled,
    order_alerts_enabled: settings.order_alerts_enabled,
    compact_dashboard: settings.compact_dashboard,
    allow_out_of_stock_cart: settings.allow_out_of_stock_cart,
    maintenance_mode: settings.maintenance_mode,
    announcement_text: settings.announcement_text || "",
  };
}

export function AdminSettingsContent() {
  const { data: settings, isLoading, isError, refetch, isFetching } = useGetAdminSettingsQuery();

  return (
    <>
      <TopHeader title="Settings" />
      <main className="flex flex-1 flex-col gap-6 bg-slate-50/80 p-4 lg:p-7">
        <div>
          <p className="text-sm font-medium text-primary-color">Admin controls</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage store, checkout, inventory, and alert behavior from one place.</p>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm font-semibold text-slate-500">
            Loading settings...
          </div>
        ) : isError || !settings ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold text-slate-800">Settings could not be loaded</p>
            <Button className="mt-4 bg-primary-color text-white hover:bg-primary-color/90" onClick={() => refetch()} disabled={isFetching}>
              Try again
            </Button>
          </div>
        ) : (
          <SettingsForm key={settings.updated_at} settings={settings} />
        )}
      </main>
    </>
  );
}

function SettingsForm({ settings }: { settings: AdminStoreSettings }) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [draft, setDraft] = useState<SettingsDraft>(() => toDraft(settings));
  const [saved, setSaved] = useState(false);
  const [updateSettings, updateState] = useUpdateAdminSettingsMutation();
  const [sendTestAlert, testAlertState] = useSendTestAlertMutation();
  const [testAlertMessage, setTestAlertMessage] = useState("");
  const displayName =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
    user?.email ||
    "Admin User";

  const updateDraft = <Key extends keyof SettingsDraft>(
    key: Key,
    value: SettingsDraft[Key],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const saveSettings = async () => {
    const savedSettings = await updateSettings({
      ...draft,
      currency_code: draft.currency_code.toUpperCase(),
      low_stock_threshold: Number(draft.low_stock_threshold),
    }).unwrap();
    setDraft(toDraft(savedSettings));
    setSaved(true);
  };

  const handleSendTestAlert = async () => {
    setTestAlertMessage("");
    try {
      const result = await sendTestAlert().unwrap();
      setTestAlertMessage(`Test alert sent to ${result.alert_email}.`);
    } catch {
      setTestAlertMessage("Could not send test alert. Check toggles, alert email, and SMTP settings.");
    }
  };

  const discardChanges = () => {
    setDraft(toDraft(settings));
    setSaved(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-400">
          Last updated {new Date(settings.updated_at).toLocaleString()}
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 min-w-32" onClick={discardChanges} disabled={updateState.isLoading}>
            <RotateCcw /> Discard
          </Button>
          <Button type="button" size="sm" className="h-9 min-w-32 bg-primary-color text-white hover:bg-primary-color/90" onClick={() => void saveSettings()} disabled={updateState.isLoading}>
            <Save /> {updateState.isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
      {saved && <p className="text-sm font-semibold text-emerald-600">Settings saved to backend.</p>}
      {updateState.isError && <p className="text-sm font-semibold text-red-600">Could not save settings. Check the values and try again.</p>}

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel icon={<UserRound className="h-5 w-5 text-primary-color" />} title="Account">
          <div className="space-y-4">
            <ReadOnlyField label="Name" value={displayName} />
            <ReadOnlyField label="Email" value={user?.email || ""} />
            <ReadOnlyField label="Role" value={user?.role || "admin"} />
          </div>
        </Panel>

        <Panel icon={<Store className="h-5 w-5 text-primary-color" />} title="Store identity">
          <div className="grid gap-4 md:grid-cols-2">
            <EditableField label="Store name" value={draft.store_name} onChange={(value) => updateDraft("store_name", value)} />
            <EditableField label="Support email" value={draft.support_email} onChange={(value) => updateDraft("support_email", value)} />
            <EditableField label="Alert email" value={draft.alert_email} onChange={(value) => updateDraft("alert_email", value)} />
            <EditableField label="Support phone" value={draft.support_phone} onChange={(value) => updateDraft("support_phone", value)} />
            <EditableField label="Currency code" maxLength={3} value={draft.currency_code} onChange={(value) => updateDraft("currency_code", value.toUpperCase())} />
          </div>
        </Panel>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel icon={<Package className="h-5 w-5 text-primary-color" />} title="Inventory">
          <div className="space-y-5">
            <EditableField
              label="Low stock threshold"
              type="number"
              min={1}
              value={String(draft.low_stock_threshold)}
              onChange={(value) => updateDraft("low_stock_threshold", Number(value || 1))}
            />
            <ToggleRow
              id="allow-out-of-stock-cart"
              label="Allow out-of-stock cart additions"
              checked={draft.allow_out_of_stock_cart}
              onCheckedChange={(checked) => updateDraft("allow_out_of_stock_cart", checked)}
            />
          </div>
        </Panel>

        <Panel icon={<CreditCard className="h-5 w-5 text-primary-color" />} title="Checkout">
          <EditableField
            label="Default shipping fee"
            type="number"
            min={0}
            step="0.01"
            value={draft.default_shipping_fee}
            onChange={(value) => updateDraft("default_shipping_fee", value)}
          />
        </Panel>

        <Panel icon={<Bell className="h-5 w-5 text-primary-color" />} title="Notifications">
          <div className="space-y-3">
            <ToggleRow id="email-alerts" label="Email alerts" checked={draft.email_alerts_enabled} onCheckedChange={(checked) => updateDraft("email_alerts_enabled", checked)} />
            <ToggleRow id="order-alerts" label="New order alerts" checked={draft.order_alerts_enabled} onCheckedChange={(checked) => updateDraft("order_alerts_enabled", checked)} />
            <Button type="button" variant="outline" size="sm" className="h-9 min-w-32" onClick={() => void handleSendTestAlert()} disabled={testAlertState.isLoading}>
              {testAlertState.isLoading ? "Sending..." : "Send test alert"}
            </Button>
            {testAlertMessage && (
              <p className={`text-xs font-semibold ${testAlertState.isError ? "text-red-600" : "text-emerald-600"}`}>
                {testAlertMessage}
              </p>
            )}
          </div>
        </Panel>

        <Panel icon={<ShieldCheck className="h-5 w-5 text-primary-color" />} title="Workspace">
          <div className="space-y-3">
            <ToggleRow id="compact-dashboard" label="Compact dashboard" checked={draft.compact_dashboard} onCheckedChange={(checked) => updateDraft("compact_dashboard", checked)} />
            <ToggleRow id="maintenance-mode" label="Maintenance mode" checked={draft.maintenance_mode} onCheckedChange={(checked) => updateDraft("maintenance_mode", checked)} />
          </div>
        </Panel>
      </section>

      <Panel icon={<Megaphone className="h-5 w-5 text-primary-color" />} title="Store announcement">
        <EditableField
          label="Announcement text"
          value={draft.announcement_text}
          onChange={(value) => updateDraft("announcement_text", value)}
          placeholder="Example: Free shipping this weekend"
        />
      </Panel>
    </>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} readOnly className="bg-slate-50 text-slate-500" />
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  type = "text",
  min,
  maxLength,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  maxLength?: number;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        min={min}
        maxLength={maxLength}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ToggleRow({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-100 px-3 py-2">
      <Label htmlFor={id} className="text-slate-700">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
