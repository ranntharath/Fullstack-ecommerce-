"use client";

import { Button } from "@/components/ui/button";
import { ProductListItem } from "@/features/client/products/types";
import { ProductGrid } from "@/features/client/products/components/ProductGrid";
import { ProductGridSkeleton } from "@/features/client/products/components/ProductGridSkeleton";

interface CatalogResultsProps {
  search?: string;
  category?: string;
  brand?: string;
  products: ProductListItem[];
  isLoading: boolean;
  onClearFilters: () => void;
  productGridClassName?: string;
}

export function CatalogResults({
  search,
  category,
  brand,
  products,
  isLoading,
  onClearFilters,
  productGridClassName,
}: CatalogResultsProps) {
  const activeFilters = [
    search ? `Search: "${search}"` : null,
    category ? `Category: ${category}` : null,
    brand ? `Brand: ${brand}` : null,
  ].filter(Boolean);

  return (
    <section className="space-y-6">
      <div className="flex flex-col border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Products
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading
              ? "Loading matching products..."
              : `${products.length} ${products.length === 1 ? "result" : "results"}`}
            {activeFilters.length > 0 && ` | ${activeFilters.join(" | ")}`}
          </p>
        </div>
        <Button onClick={onClearFilters} variant="outline" className="mt-4 text-xs sm:mt-0">
          Clear Filters
        </Button>
      </div>

      {isLoading ? (
        <ProductGridSkeleton />
      ) : products.length > 0 ? (
        <ProductGrid products={products} className={productGridClassName} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white px-4 py-16 text-center">
          <svg className="h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-slate-800">No products found</h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            We couldn&apos;t find any items matching your active filter criteria. Try adjusting your search query or categories.
          </p>
          <Button onClick={onClearFilters} className="mt-6 bg-primary-color text-white hover:bg-primary-color/90">
            Reset Search
          </Button>
        </div>
      )}
    </section>
  );
}
