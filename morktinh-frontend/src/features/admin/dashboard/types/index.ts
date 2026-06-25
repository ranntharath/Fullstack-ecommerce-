export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface DashboardSummary {
  revenue: string;
  orders: number;
  customers: number;
  products: number;
  low_stock_count: number;
  revenue_change: number;
  orders_change: number;
  pending_orders: number;
  low_stock_threshold: number;
  order_alerts_enabled: boolean;
}

export interface SalesTrendPoint {
  date: string;
  revenue: string;
}

export interface OrderStatusSummary {
  status: OrderStatus;
  label: string;
  count: number;
}

export interface RecentOrder {
  id: number;
  customer: string;
  email: string;
  total: string;
  status: OrderStatus;
  created_at: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  sales_trend: SalesTrendPoint[];
  order_statuses: OrderStatusSummary[];
  recent_orders: RecentOrder[];
  low_stock_items: LowStockItem[];
}

export interface LowStockItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  stock: number;
}
