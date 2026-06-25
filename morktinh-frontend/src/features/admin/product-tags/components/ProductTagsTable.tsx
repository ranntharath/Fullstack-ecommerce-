"use client";

import { useMemo, useState } from "react";
import { GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Pencil, Trash2 } from "lucide-react";
import DataTable from "@/components/layouts/admin/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDeleteModal from "@/components/common/admin/ConfirmDeleteModal";
import { useDeleteProductTagMutation, useGetProductTagsPageQuery } from "../api/productTagsApi";
import { ProductTag } from "../types";
import EditProductTagModal from "./EditProductTagModal";

export default function ProductTagsTable() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const { data: productTagsPage, isLoading, isFetching } = useGetProductTagsPageQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });
  const [deleteProductTagApi, { isLoading: isDeleting }] = useDeleteProductTagMutation();
  const [editProductTag, setEditProductTag] = useState<ProductTag | null>(null);
  const [deleteProductTag, setDeleteProductTag] = useState<ProductTag | null>(null);

  const handleDelete = async () => {
    if (!deleteProductTag) return;

    try {
      await deleteProductTagApi(deleteProductTag.id).unwrap();
      setDeleteProductTag(null);
    } catch (error) {
      console.error("Failed to delete product tag:", error);
    }
  };

  const columns = useMemo<GridColDef<ProductTag>[]>(() => [
    { field: "id", headerName: "ID", width: 70, minWidth: 70 },
    { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
    { field: "slug", headerName: "Slug", minWidth: 180, flex: 1 },
    {
      field: "is_active",
      headerName: "Status",
      minWidth: 110,
      flex: 0.5,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${params.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {params.value ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setEditProductTag(params.row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteProductTag(params.row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="w-full h-full">
      <DataTable rows={productTagsPage?.results ?? []} columns={columns as GridColDef[]} loading={isLoading || isFetching} paginationMode="server" rowCount={productTagsPage?.count ?? 0} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} />

      {editProductTag && (
        <EditProductTagModal
          key={editProductTag.id}
          productTag={editProductTag}
          open={!!editProductTag}
          onClose={() => setEditProductTag(null)}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteProductTag}
        onClose={() => setDeleteProductTag(null)}
        onConfirm={handleDelete}
        title="Delete Product Tag"
        description={<>Are you sure you want to delete <strong>{deleteProductTag?.name}</strong>? Products using this tag will lose it.</>}
        isLoading={isDeleting}
      />
    </div>
  );
}
