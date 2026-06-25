"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetClientProductQuery } from "@/features/client/products/api/productsApi";
import { ProductDetails } from "@/features/client/products/components/details/ProductDetails";
import { ProductDetailsSkeleton } from "@/features/client/products/components/details/ProductDetailsSkeleton";

export function ClientProductDetailPageContent() {
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);
  const isValidId = Number.isInteger(productId) && productId > 0;
  const {
    data: product,
    isLoading,
    isError,
  } = useGetClientProductQuery(productId, {
    skip: !isValidId,
  });

  if (!isValidId || isError) {
    return (
      <div className="flexmin-h-105 flex-1 items-center justify-center bg-slate-50/50 px-4">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-slate-950">Product not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This product may have been removed or is no longer active.
          </p>
          <Button asChild className="mt-5 bg-primary-color text-white hover:bg-primary-color/90">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return <ProductDetailsSkeleton />;
  }

  return <ProductDetails product={product} />;
}
