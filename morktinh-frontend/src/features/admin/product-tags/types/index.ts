export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductTagsResponse {
  results: ProductTag[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface CreateProductTagRequest {
  name: string;
  is_active: boolean;
}
