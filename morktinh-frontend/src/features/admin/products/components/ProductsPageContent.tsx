import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layouts/admin/top-header";
import ProductsTable from "./ProductsTable";

export function ProductsPageContent() {
  return (
    <>
      <TopHeader title="Products" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <Link href="/admin/products/add">
            <Button className="rounded-sm bg-primary-color hover:bg-primary-color/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
        <div className="w-full min-w-0">
          <div className="bg-white p-4 rounded-md shadow-sm border h-[calc(100vh-180px)]">
            <ProductsTable />
          </div>
        </div>
      </div>
    </>
  );
}
