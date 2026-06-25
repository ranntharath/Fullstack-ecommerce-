export interface AdminStoreSettings {
  store_name: string;
  support_email: string;
  alert_email: string;
  support_phone: string;
  currency_code: string;
  default_shipping_fee: string;
  low_stock_threshold: number;
  email_alerts_enabled: boolean;
  order_alerts_enabled: boolean;
  compact_dashboard: boolean;
  allow_out_of_stock_cart: boolean;
  maintenance_mode: boolean;
  announcement_text: string;
  updated_at: string;
}

export type UpdateAdminStoreSettingsRequest = Partial<
  Omit<AdminStoreSettings, "updated_at">
>;
