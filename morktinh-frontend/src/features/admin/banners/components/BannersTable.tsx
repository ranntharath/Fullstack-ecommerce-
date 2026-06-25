/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from 'react';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DataTable from '@/components/layouts/admin/DataTable';
import { useGetBannersPageQuery, useDeleteBannerMutation } from '../api/bannersApi';
import { Banner } from '../types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

import ConfirmDeleteModal from '@/components/common/admin/ConfirmDeleteModal';
import EditBannerModal from './EditBannerModal';

export default function BannersTable() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const { data: bannersPage, isLoading, isFetching } = useGetBannersPageQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  });
  const [deleteBannerApi, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [deleteBanner, setDeleteBanner] = useState<Banner | null>(null);

  const handleDelete = async () => {
    if (!deleteBanner) return;
    try {
      await deleteBannerApi(deleteBanner.id).unwrap();
      setDeleteBanner(null);
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  const columns = useMemo<GridColDef<Banner>[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      minWidth: 70,
    },
    {
      field: 'banner_image',
      headerName: 'Image',
      width: 120,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          {params.value ? (
            <img src={params.value} alt={params.row.title || 'Banner'} className="h-10 w-20 object-cover rounded-md" />
          ) : (
            <div className="h-10 w-20 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">No Img</div>
          )}
        </div>
      )
    },
    {
      field: 'title',
      headerName: 'Title',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'button_title',
      headerName: 'Btn Title',
      minWidth: 130,
      flex: 1,
      renderCell: (params) => params.value || '-'
    },
    {
      field: 'button_color',
      headerName: 'Btn Color',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full">
          {params.value && (
            <div
              className="w-4 h-4 rounded-full border border-gray-200"
              style={{ backgroundColor: params.value }}
            />
          )}
          <span>{params.value || '-'}</span>
        </div>
      )
    },
    {
      field: 'order',
      headerName: 'Order',
      width: 100,
      minWidth: 100,
    },
    {
      field: 'is_active',
      headerName: 'Status',
      minWidth: 110,
      flex: 0.5,
      renderCell: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {params.value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setEditBanner(params.row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteBanner(params.row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="w-full h-full">
      <DataTable
        rows={bannersPage?.results ?? []}
        columns={columns as GridColDef[]}
        loading={isLoading || isFetching}
        paginationMode="server"
        rowCount={bannersPage?.count ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      {editBanner && (
        <EditBannerModal
          banner={editBanner}
          open={!!editBanner}
          onClose={() => setEditBanner(null)}
        />
      )}

      <ConfirmDeleteModal
        open={!!deleteBanner}
        onClose={() => setDeleteBanner(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        description={<>Are you sure you want to delete banner <strong>{deleteBanner?.title || `#${deleteBanner?.id}`}</strong>? This action cannot be undone.</>}
        isLoading={isDeleting}
      />
    </div>
  );
}
