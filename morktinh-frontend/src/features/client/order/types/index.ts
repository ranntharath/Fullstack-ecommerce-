import { CustomerAddressRequest } from "@/features/client/profile/types";

export type PaymentMethod = "cash_on_delivery" | "bank_transfer" | "khqr";

export interface CreateOrderRequest {
  address_id?: number;
  new_address?: CustomerAddressRequest;
  save_address?: boolean;
  contact_email?: string;
  notes?: string;
  payment_method: PaymentMethod;
}

export interface OrderItem {
  id: number;
  product: number;
  variant: number | null;
  product_image: string | null;
  product_name: string;
  variant_sku: string;
  variant_attributes: Record<string, string> | null;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface Order {
  id: number;
  customer: number;
  address: number | null;
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
  status: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface KHQRPaymentResponse {
  qr_string: string;
  qr_image_base64: string;
  qr_image_data_url: string;
  md5: string;
  amount: string;
}

export type KHQRPaymentStatus = "PAID" | "UNPAID" | "NOT_FOUND" | string;

export interface KHQRPaymentStatusResponse {
  order_id: number;
  status: KHQRPaymentStatus;
  order_status: string;
}
