import { TopHeader } from "@/components/layouts/admin/top-header";
import AddProductTagModal from "./AddProductTagModal";
import ProductTagsTable from "./ProductTagsTable";

export function ProductTagsPageContent() {
  return (
    <>
      <TopHeader title="Product Tags" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Product Tags</h1>
          <AddProductTagModal />
        </div>
        <div className="w-full min-w-0">
          <ProductTagsTable />
        </div>
      </div>
    </>
  );
}
