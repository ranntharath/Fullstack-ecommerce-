import React, { useState } from 'react';
import { Discount } from '../types';
import { useDeleteDiscountMutation } from '../api/discountsApi';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Pencil, Trash2, Globe, Tag } from 'lucide-react';
import EditDiscountModal from './EditDiscountModal';
import DataTable from '@/components/layouts/admin/DataTable';
import { Button } from '@/components/ui/button';
import ConfirmDeleteModal from '@/components/common/admin/ConfirmDeleteModal';

interface DiscountsTableProps {
  discounts: Discount[];
  isLoading: boolean;
  rowCount: number;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

export default function DiscountsTable({ discounts, isLoading, rowCount, paginationModel, onPaginationModelChange }: DiscountsTableProps) {
  const [deleteDiscountApi, { isLoading: isDeleting }] = useDeleteDiscountMutation();
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteDiscount, setDeleteDiscount] = useState<Discount | null>(null);

  const handleDelete = async () => {
    if (!deleteDiscount) return;
    try {
      await deleteDiscountApi(deleteDiscount.id).unwrap();
      setDeleteDiscount(null);
    } catch (error) {
      console.error('Failed to delete discount:', error);
      alert('Failed to delete discount.');
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 50 },
    { field: 'name', headerName: 'Discount Name', flex: 1, minWidth: 150 },
    {
      field: 'discount_type',
      headerName: 'Type',
      width: 100,
      renderCell: (params) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${params.row.discount_type === 'percent'
            ? 'bg-slate-900 text-slate-50'
            : 'bg-slate-100 text-slate-800'
          }`}>
          {params.row.discount_type}
        </span>
      ),
    },
    {
      field: 'value',
      headerName: 'Value',
      width: 100,
      renderCell: (params) => (
        <span className="font-medium text-slate-700">
          {params.row.discount_type === 'percent' ? `${params.row.value}%` : `$${params.row.value}`}
        </span>
      ),
    },
    {
      field: 'is_global',
      headerName: 'Global',
      width: 100,
      renderCell: (params) => (
        params.row.is_global ? (
          <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <Globe className="w-3 h-3 mr-1" /> Yes
          </span>
        ) : (
          <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            <Tag className="w-3 h-3 mr-1" /> Product
          </span>
        )
      ),
    },
    {
      field: 'override_product_discount',
      headerName: 'Override',
      width: 110,
      renderCell: (params) => (
        params.row.is_global && params.row.override_product_discount ? (
          <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            Yes
          </span>
        ) : (
          <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            No
          </span>
        )
      ),
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${params.row.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {params.row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      width: 110,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      width: 110,
      valueFormatter: (value) => new Date(value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-2 h-full">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setEditingDiscount(params.row as Discount)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => setDeleteDiscount(params.row as Discount)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <>
      <div className="bg-white rounded-md shadow-sm border border-slate-200">
        <DataTable
          rows={discounts}
          columns={columns}
          loading={isLoading}
          paginationMode="server"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
        />
      </div>

      <EditDiscountModal
        discount={editingDiscount}
        isOpen={!!editingDiscount}
        onClose={() => setEditingDiscount(null)}
      />

      <ConfirmDeleteModal 
        open={!!deleteDiscount}
        onClose={() => setDeleteDiscount(null)}
        onConfirm={handleDelete}
        title="Delete Discount"
        description={<>Are you sure you want to delete <strong>{deleteDiscount?.name}</strong>? This action cannot be undone.</>}
        isLoading={isDeleting}
      />
    </>
  );
}
