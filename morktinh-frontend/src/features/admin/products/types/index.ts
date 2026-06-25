export interface CategoryDetail {
  id: number;
  name: string;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandDetail {
  id: number;
  name: string;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductSpecification = Record<string, unknown>;

export interface DiscountDetail {
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

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

import { ProductMedia, ProductVideo } from '@/features/admin/product-media/types';
import { ProductOption, ProductOptionGroup } from '@/features/admin/product-options/types';
import { ProductVariant, VariantOption } from '@/features/admin/product-variants/types';
import { ProductFreeItem } from '@/features/admin/product-free-items/types';

export type {
  ProductMedia,
  ProductVideo,
  ProductOption,
  ProductOptionGroup,
  ProductVariant,
  VariantOption,
  ProductFreeItem,
};

export interface Product {
  id: number;
  category: number;
  category_detail: CategoryDetail;
  brand: number;
  brand_detail: BrandDetail;
  discounts: number[];
  discount_details: DiscountDetail[];
  tags: number[];
  tag_details: ProductTag[];
  name: string;
  slug: string;
  description: string | null;
  detail: string | null;
  base_price: string;
  final_price: string;
  specification: ProductSpecification | null;
  is_active: boolean;
  is_feature: boolean;
  created_at: string;
  updated_at: string;
  medias: ProductMedia[];
  videos: ProductVideo[];
  option_groups: ProductOptionGroup[];
  variants: ProductVariant[];
  free_items: ProductFreeItem[];
}

export interface ProductListItem {
  id: number;
  category: number;
  category_detail: CategoryDetail;
  brand: number;
  brand_detail: BrandDetail;
  discounts: number[];
  discount_details: DiscountDetail[];
  tags: number[];
  tag_details: ProductTag[];
  name: string;
  slug: string;
  base_price: string;
  final_price: string;
  is_active: boolean;
  is_feature: boolean;
  created_at: string;
  updated_at: string;
  medias: ProductMedia[];
  variants_count: number;
}

export interface ProductsResponse {
  results: ProductListItem[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface ProductTagsResponse {
  results: ProductTag[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CreateProductRequest {
  category: number;
  brand: number;
  name: string;
  base_price: string;
  description?: string;
  detail?: string;
  specification?: ProductSpecification;
  is_active?: boolean;
  is_feature?: boolean;
  discounts?: number[];
  tags?: number[];
}
