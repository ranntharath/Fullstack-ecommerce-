export interface Discount {
  id: number;
  name: string;
  discount_type: 'percent' | 'fixed';
  value: string;
  is_global: boolean;
  override_product_discount: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface DiscountsResponse {
  results: Discount[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CreateDiscountRequest {
  name: string;
  discount_type: 'percent' | 'fixed';
  value: string;
  is_global: boolean;
  override_product_discount: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string;
}
