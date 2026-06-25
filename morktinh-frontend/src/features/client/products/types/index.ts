import { BrandDetail } from "@/features/client/brands/types";
import { CategoryDetail } from "@/features/client/categories/types";

export type ClientProductListFilters = {
  search?: string;
  category?: string;
  brand?: string;
  tag?: string;
  featured?: boolean;
  in_stock?: boolean;
  has_discount?: boolean;
  min_price?: string;
  max_price?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
};

export interface DiscountDetail {
  id: number;
  name: string;
  discount_type: "percent" | "fixed";
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

export interface ProductMedia {
  id: number;
  image: string;
  is_thumbnail: boolean;
}

export interface ProductVideo {
  id: number;
  product: number;
  video_url: string;
  is_main: boolean;
}

export interface ProductOption {
  id: number;
  group: number;
  group_title?: string;
  value: string;
}

export interface ProductOptionGroup {
  id: number;
  product: number;
  title: string;
  options: ProductOption[];
}

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

export interface ProductFreeItem {
  id: number;
  product: number;
  name: string;
  image: string | null;
  is_active: boolean;
}

export type ProductSpecification = Record<string, unknown>;

export interface Product {
  id: number;
  category: number;
  category_detail: CategoryDetail;
  brand: number;
  brand_detail: BrandDetail;
  discounts: number[];
  discount_details: DiscountDetail[];
  active_discount: DiscountDetail | null;
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
  active_discount: DiscountDetail | null;
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
