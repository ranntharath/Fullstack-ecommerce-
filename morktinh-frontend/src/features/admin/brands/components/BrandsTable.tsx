/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from 'react';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import DataTable from '@/components/layouts/admin/DataTable';
import { useGetBrandsPageQuery, useDeleteBrandMutation } from '../api/brandsApi';
import { Brand } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterX, Pencil, Search, Trash2 } from 'lucide-react';

import ConfirmDeleteModal from '@/components/common/admin/ConfirmDeleteModal';
import EditBrandModal from './EditBrandModal';

export default function BrandsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const trimmedSearchTerm = debouncedSearchTerm.trim();
  const brandFilters = useMemo(() => ({
    search: trimmedSearchTerm || undefined,
    active: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  }), [paginationModel.page, paginationModel.pageSize, statusFilter, trimmedSearchTerm]);

  const { data: brandsPage, isLoading, isFetching } = useGetBrandsPageQuery(brandFilters);
  const [deleteBrandApi, { isLoading: isDeleting }] = useDeleteBrandMutation();

  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);
  const hasActiveFilters = !!searchTerm.trim() || statusFilter !== 'all';

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPaginationModel((current) => ({ ...current, page: 0 }));
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setStatusFilter('all');
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const handleDelete = async () => {
    if (!deleteBrand) return;
    try {
      await deleteBrandApi(deleteBrand.id).unwrap();
      setDeleteBrand(null);
    } catch (error) {
      console.error("Failed to delete brand:", error);
    }
  };

  const columns = useMemo<GridColDef<Brand>[]>(() => [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      minWidth: 70,
    },
    {
      field: 'image',
      headerName: 'Image',
      width: 90,
      minWidth: 90,
      sortable: false,
      renderCell: (params) => (
        params.value ? (
          <img src={params.value} alt={params.row.name} className="h-10 w-10 object-cover rounded-md mt-1" />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded-md mt-1 flex items-center justify-center text-xs text-gray-500">No Img</div>
        )
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'slug',
      headerName: 'Slug',
      minWidth: 160,
      flex: 1,
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
        <div className="flex items-center gap-2 mt-1">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setEditBrand(params.row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteBrand(params.row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_224px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search brands"
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPaginationModel((current) => ({ ...current, page: 0 })); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          <FilterX className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <DataTable
        rows={brandsPage?.results ?? []}
        columns={columns as GridColDef[]}
        loading={isLoading || isFetching}
        paginationMode="server"
        rowCount={brandsPage?.count ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />

      <EditBrandModal
        brand={editBrand}
        open={!!editBrand}
        onClose={() => setEditBrand(null)}
      />

      <ConfirmDeleteModal
        open={!!deleteBrand}
        onClose={() => setDeleteBrand(null)}
        onConfirm={handleDelete}
        title="Delete Brand"
        description={<>Are you sure you want to delete <strong>{deleteBrand?.name}</strong>? This action cannot be undone.</>}
        isLoading={isDeleting}
      />
    </div>
  );
}
