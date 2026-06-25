export interface ProductMedia {
  id: number;
  product: number;
  image: string;
  is_thumbnail: boolean;
}

export interface ProductVideo {
  id: number;
  product: number;
  video_url: string;
  is_main: boolean;
}
