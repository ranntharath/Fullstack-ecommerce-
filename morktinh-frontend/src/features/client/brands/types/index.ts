export interface BrandDetail {
  id: number;
  name: string;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandsResponse {
  results: Brand[];
  count: number;
  next: string | null;
  previous: string | null;
}
