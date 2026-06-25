"use client";

import { useState } from "react";
import type { GridPaginationModel } from "@mui/x-data-grid";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layouts/admin/top-header";
import { useGetDiscountsPageQuery } from "@/features/admin/discounts/api/discountsApi";
import AddDiscountModal from "./AddDiscountModal";
import DiscountsTable from "./DiscountsTable";

export function DiscountsPageContent() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const { data: discountsPage, isLoading, isFetching } = useGetDiscountsPageQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <TopHeader title="Discounts Management" />
      <div className="mx-auto flex-1 w-full max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">Discounts</h2>
            <p className="text-slate-500">Manage global and product-specific discounts, promotions, and sales.</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary-color hover:bg-primary-color/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add Discount
          </Button>
        </div>
        <DiscountsTable discounts={discountsPage?.results ?? []} isLoading={isLoading || isFetching} rowCount={discountsPage?.count ?? 0} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} />
      </div>
      <AddDiscountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
}
