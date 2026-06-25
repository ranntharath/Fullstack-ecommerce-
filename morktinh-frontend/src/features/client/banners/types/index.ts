export interface Banner {
  id: number;
  banner_image: string | null;
  title: string | null;
  description: string | null;
  button_title: string | null;
  button_color: string | null;
  is_active: boolean;
  order: number;
}

export interface BannersResponse {
  results: Banner[];
  count: number;
  next: string | null;
  previous: string | null;
}
