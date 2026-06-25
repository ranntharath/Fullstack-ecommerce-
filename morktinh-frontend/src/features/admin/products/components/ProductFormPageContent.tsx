import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layouts/admin/top-header";
import UnifiedProductForm from "./forms/UnifiedProductForm";

interface ProductFormPageContentProps {
  mode: "add" | "edit";
  productId?: number;
}

export function ProductFormPageContent({ mode, productId }: ProductFormPageContentProps) {
  const isEditMode = mode === "edit";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <TopHeader title={isEditMode ? "Edit Product" : "Add New Product"}>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products
          </Link>
        </Button>
      </TopHeader>

      <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Product Details</h2>
          <p className="text-slate-500">
            {isEditMode
              ? "Modify the product details, add/remove images, and manage variants."
              : "Create a product, add images, and generate variants all in one place."}
          </p>
        </div>
        <UnifiedProductForm productId={productId} />
      </div>
    </div>
  );
}
