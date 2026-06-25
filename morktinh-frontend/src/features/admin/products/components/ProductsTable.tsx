/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from 'react';
import { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import DataTable from '@/components/layouts/admin/DataTable';
import { useGetProductsPageQuery, useDeleteProductMutation } from '../api/productsApi';
import { useGetCategoriesQuery } from '@/features/admin/categories/api/categoriesApi';
import { useGetBrandsQuery } from '@/features/admin/brands/api/brandsApi';
import { ProductListItem } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterX, ImageIcon, Pencil, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ConfirmDeleteModal from '@/components/common/admin/ConfirmDeleteModal';

export default function ProductsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const trimmedSearchTerm = debouncedSearchTerm.trim();
  const productFilters = useMemo(() => ({
    search: trimmedSearchTerm || undefined,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    brand: selectedBrand === 'all' ? undefined : selectedBrand,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
  }), [paginationModel.page, paginationModel.pageSize, selectedBrand, selectedCategory, trimmedSearchTerm]);

  const { data: productsPage, isLoading, isFetching } = useGetProductsPageQuery(productFilters);
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: brands = [], isLoading: isLoadingBrands } = useGetBrandsQuery();
  const [deleteProductApi, { isLoading: isDeleting }] = useDeleteProductMutation();

  const [deleteProduct, setDeleteProduct] = useState<ProductListItem | null>(null);
  const hasActiveFilters = !!trimmedSearchTerm || selectedCategory !== 'all' || selectedBrand !== 'all';

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
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPaginationModel((current) => ({ ...current, page: 0 }));
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    try {
      await deleteProductApi(deleteProduct.id).unwrap();
      setDeleteProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const columns = useMemo<GridColDef<ProductListItem>[]>(() => [
    {
      field: 'image',
      headerName: 'Image',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => {
        const thumbnail = params.row.medias?.find(m => m.is_thumbnail)?.image
          || params.row.medias?.[0]?.image;
        return thumbnail ? (
          <div className="flex items-center h-full py-2">
            <img src={thumbnail} alt={params.row.name} className="w-12 h-12 object-cover rounded-md border" />
          </div>
        ) : (
          <div className="flex items-center h-full py-2">
            <div className="w-12 h-12 bg-slate-50 rounded-md border border-dashed flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Product Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex flex-col justify-center py-2 h-full">
          <span className="font-semibold text-slate-900">{params.row.name}</span>
          <div className="flex gap-2 items-center mt-1">
            {params.row.is_feature && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold border border-amber-200">
                Featured
              </span>
            )}
            <span className="text-xs text-slate-600">{params.row.variants_count} variants</span>
          </div>
        </div>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 140,
      valueGetter: (params, row: ProductListItem) => row.category_detail?.name || '-',
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium text-slate-700">{params.row.category_detail?.name || '-'}</span>
        </div>
      )
    },
    {
      field: 'brand',
      headerName: 'Brand',
      width: 140,
      valueGetter: (params, row: ProductListItem) => row.brand_detail?.name || '-',
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium text-slate-700">{params.row.brand_detail?.name || '-'}</span>
        </div>
      )
    },
    {
      field: 'base_price',
      headerName: 'Base Price',
      width: 120,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex items-center h-full">
          <span className="font-medium text-slate-900">${params.row.base_price}</span>
        </div>
      )
    },
    {
      field: 'final_price',
      headerName: 'Final Price',
      width: 120,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex items-center h-full">
          <span className="font-semibold text-emerald-700">${params.row.final_price}</span>
        </div>
      )
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 110,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => (
        <div className="flex items-center h-full">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${params.row.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
            }`}>
            {params.row.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams<ProductListItem>) => {
        return (
          <div className="flex gap-2 items-center h-full">
            <Link href={`/admin/products/edit/${params.row.id}`}>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setDeleteProduct(params.row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_224px_224px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products"
              className="pl-9"
            />
          </div>

          <Select value={selectedCategory} onValueChange={(value) => { setSelectedCategory(value); setPaginationModel((current) => ({ ...current, page: 0 })); }} disabled={isLoadingCategories}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBrand} onValueChange={(value) => { setSelectedBrand(value); setPaginationModel((current) => ({ ...current, page: 0 })); }} disabled={isLoadingBrands}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
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
        paginationMode="server"
        rowCount={productsPage?.count ?? 0}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        rows={productsPage?.results ?? []}
        columns={columns as GridColDef[]}
        loading={isLoading || isFetching}
      />

      <ConfirmDeleteModal
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={<>Are you sure you want to delete <strong>{deleteProduct?.name}</strong>? All variants and media associated with this product will also be deleted. This action cannot be undone.</>}
        isLoading={isDeleting}
      />
    </div>
  );
}
