import { ProductListItem, ProductVariant } from "@/features/client/products/types";

export interface CartItem {
  id: number;
  cart: number;
  product: number;
  product_detail: ProductListItem;
  variant: number | null;
  variant_detail: ProductVariant | null;
  quantity: number;
  unit_price: string;
  line_total: string;
  created_at: string;
  updated_at: string;
}

export interface AddCartItemRequest {
  product: number;
  variant?: number | null;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  id: number;
  quantity: number;
}
