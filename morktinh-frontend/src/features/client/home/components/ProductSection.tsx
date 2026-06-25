"use client";

import { ProductListItem } from "@/features/client/products/types";
import { ProductGrid } from "@/features/client/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/client/products/components/ProductGridSkeleton";

interface ProductSectionProps {
  title: string;
  label: string;
  accentClassName: string;
  products: ProductListItem[];
  isLoading: boolean;
  emptyMessage: string;
}

export function ProductSection({
  title,
  label,
  accentClassName,
  products,
  isLoading,
  emptyMessage,
}: ProductSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <span className={`flex h-3 w-3 rounded-full ${accentClassName}`} />
          <h2 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            {title}
          </h2>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-color">
          {label}
        </span>
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <p className="py-4 text-sm text-slate-400">{emptyMessage}</p>
      )}
    </section>
  );
}
