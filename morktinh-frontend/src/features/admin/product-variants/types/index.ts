import { ProductOption } from '@/features/admin/product-options/types';

export interface VariantOption {
  id: number;
  variant: number;
  option: number;
  option_detail?: ProductOption;
}

export interface ProductVariant {
  id: number;
  product: number;
  sku: string;
  stock: number;
  price: string;
  variant_final_price: string;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  attributes: Record<string, string>;
  variant_options: VariantOption[];
}
