import { TopHeader } from "@/components/layouts/admin/top-header";
import AddCategoryModal from "./AddCategoryModal";
import CategoriesTable from "./CategoriesTable";

export function CategoriesPageContent() {
  return (
    <>
      <TopHeader title="Categories" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <AddCategoryModal />
        </div>
        <div className="w-full min-w-0">
          <CategoriesTable />
        </div>
      </div>
    </>
  );
}
