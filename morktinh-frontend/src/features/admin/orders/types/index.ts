export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'bank_transfer' | 'khqr';

export interface AdminOrderItem {
  id: number;
  product: number;
  variant: number | null;
  product_name: string;
  product_image: string | null;
  variant_sku: string;
  variant_attributes: Record<string, string> | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface AdminOrder {
  id: number;
  customer: number | null;
  customer_email: string | null;
  customer_name: string;
  recipient_name: string;
  address_line1: string;
  address_line2: string | null;
  phone: string;
  city: string;
  district: string;
  commune: string;
  contact_email: string | null;
  notes: string;
  payment_method: PaymentMethod;
  payment_status: string | null;
  status: OrderStatus;
  subtotal: string;
  shipping_fee: string;
  total: string;
  items: AdminOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface AdminCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'customer';
}

export interface CreateAdminOrderRequest {
  customer: number | null;
  recipient_name: string;
  address_line1: string;
  address_line2?: string;
  phone: string;
  city: string;
  district: string;
  commune: string;
  contact_email?: string;
  notes?: string;
  payment_method: PaymentMethod;
  shipping_fee: string;
  items: Array<{ product: number; variant: number | null; quantity: number }>;
}

export interface OrderSummary {
  orders: number;
  pending: number;
  delivered: number;
  order_value: string;
}

export interface PaginatedAdminOrders {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrder[];
  summary: OrderSummary;
}
