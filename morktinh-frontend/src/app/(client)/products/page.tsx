import { Suspense } from "react";
import { ProductsPageContent } from "@/features/client/products/components/ProductsPageContent";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-100 text-slate-500">Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
