import { TopHeader } from "@/components/layouts/admin/top-header";
import AddBrandModal from "./AddBrandModal";
import BrandsTable from "./BrandsTable";

export function BrandsPageContent() {
  return (
    <>
      <TopHeader title="Brands" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
          <AddBrandModal />
        </div>
        <div className="w-full min-w-0">
          <BrandsTable />
        </div>
      </div>
    </>
  );
}
