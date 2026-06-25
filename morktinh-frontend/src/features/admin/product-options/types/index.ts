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
