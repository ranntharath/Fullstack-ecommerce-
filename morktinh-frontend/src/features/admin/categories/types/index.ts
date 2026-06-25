export interface Category {
  id: number;
  name: string;
  slug?: string;
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

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}
