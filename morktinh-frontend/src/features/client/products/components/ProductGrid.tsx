"use client";

import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/common/client/product-card";
import { ProductListItem } from "@/features/client/products/types";

interface ProductGridProps {
  products: ProductListItem[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
