import { TopHeader } from "@/components/layouts/admin/top-header";
import AddBannerModal from "./AddBannerModal";
import BannersTable from "./BannersTable";

export function MediaPageContent() {
  return (
    <>
      <TopHeader title="Product Media" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 w-full min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Product Media (Banners)</h1>
          <AddBannerModal />
        </div>
        <div className="w-full min-w-0">
          <BannersTable />
        </div>
      </div>
    </>
  );
}
