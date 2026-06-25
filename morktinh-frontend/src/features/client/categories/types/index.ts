export interface CategoryDetail {
  id: number;
  name: string;
  image: string | null;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoriesResponse {
  results: Category[];
  count: number;
  next: string | null;
  previous: string | null;
}
