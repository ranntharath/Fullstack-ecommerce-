"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useGetProductQuery
} from '../../api/productsApi';
import { useCreateProductMediaMutation, useDeleteProductMediaMutation } from '@/features/admin/product-media/api/productMediaApi';
import { useCreateOptionGroupMutation, useUpdateOptionGroupMutation, useDeleteOptionGroupMutation, useCreateOptionMutation, useUpdateOptionMutation, useDeleteOptionMutation } from '@/features/admin/product-options/api/productOptionsApi';
import { useCreateVariantMutation, useUpdateVariantMutation, useDeleteVariantMutation, useCreateVariantOptionMutation } from '@/features/admin/product-variants/api/productVariantsApi';
import { useCreateProductFreeItemMutation, useUpdateProductFreeItemMutation, useDeleteProductFreeItemMutation } from '@/features/admin/product-free-items/api/productFreeItemsApi';
import { useGetCategoriesQuery } from '@/features/admin/categories/api/categoriesApi';
import { useGetBrandsQuery } from '@/features/admin/brands/api/brandsApi';
import { useGetDiscountsQuery } from '@/features/admin/discounts/api/discountsApi';
import { useGetProductTagsQuery } from '@/features/admin/product-tags/api/productTagsApi';

import BasicInfoSection from './sections/BasicInfoSection';
import SpecificationsSection from './sections/SpecificationsSection';
import MediaSection from '@/features/admin/product-media/components/MediaSection';
import OptionsVariantsSection from '@/features/admin/product-variants/components/OptionsVariantsSection';
import FreeItemsSection from '@/features/admin/product-free-items/components/FreeItemsSection';

import { useProductMedia } from '@/features/admin/product-media/hooks/useProductMedia';
import { useProductSpecifications } from '../../hooks/useProductSpecifications';
import { useProductFreeItems } from '@/features/admin/product-free-items/hooks/useProductFreeItems';
import { useProductOptions } from '@/features/admin/product-variants/hooks/useProductOptions';
import { Product, ProductOption, ProductOptionGroup } from '../../types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  category: z.string().min(1, { message: 'Category is required' }),
  brand: z.string().min(1, { message: 'Brand is required' }),
  base_price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Price must be a valid number greater than 0',
  }),
  description: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  is_active: z.boolean(),
  is_feature: z.boolean(),
  discounts: z.array(z.string()).max(1, { message: 'Select only one product discount.' }).optional(),
  tags: z.array(z.string()).optional(),
});

interface UnifiedProductFormProps {
  productId?: number;
}

export default function UnifiedProductForm({ productId }: UnifiedProductFormProps) {
  const router = useRouter();
  const isEditMode = !!productId;

  // API Queries & Mutations
  const { data: productData, isLoading: isLoadingProduct } = useGetProductQuery(productId!, { skip: !isEditMode });
  
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  
  const [createMedia] = useCreateProductMediaMutation();
  const [deleteMedia] = useDeleteProductMediaMutation();
  
  const [createOptionGroup] = useCreateOptionGroupMutation();
  const [updateOptionGroup] = useUpdateOptionGroupMutation();
  const [deleteOptionGroup] = useDeleteOptionGroupMutation();
  
  const [createOption] = useCreateOptionMutation();
  const [updateOption] = useUpdateOptionMutation();
  const [deleteOption] = useDeleteOptionMutation();
  
  const [createVariant] = useCreateVariantMutation();
  const [updateVariant] = useUpdateVariantMutation();
  const [deleteVariant] = useDeleteVariantMutation();
  const [createVariantOption] = useCreateVariantOptionMutation();
  
  const [createFreeItem] = useCreateProductFreeItemMutation();
  const [updateFreeItem] = useUpdateProductFreeItemMutation();
  const [deleteFreeItem] = useDeleteProductFreeItemMutation();

  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const { data: brandsData, isLoading: isLoadingBrands } = useGetBrandsQuery();
  const { data: discountsData, isLoading: isLoadingDiscounts } = useGetDiscountsQuery();
  const { data: productTagsData, isLoading: isLoadingProductTags } = useGetProductTagsQuery();
  
  const categories = categoriesData || [];
  const brands = brandsData || [];
  const discounts = discountsData || [];
  const productTags = productTagsData || [];

  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', category: '', brand: '', base_price: '', description: '', detail: '',
      is_active: true, is_feature: false, discounts: [], tags: []
    },
    values: (isEditMode && productData) ? {
      name: productData.name,
      category: productData.category?.toString() || '',
      brand: productData.brand?.toString() || '',
      base_price: productData.base_price?.toString() || '',
      description: productData.description || '',
      detail: productData.detail || '',
      is_active: productData.is_active ?? true,
      is_feature: productData.is_feature ?? false,
      discounts: productData.discounts?.map((id: number) => id.toString()) || [],
      tags: productData.tags?.map((id: number) => id.toString()) || []
    } : undefined
  });

  const { mediaFiles, deletedMediaIds, fileInputRef, handleFileChange, removeMedia, setInitialMedia } = useProductMedia();
  const { specifications, addSpecification, updateSpecification, removeSpecification, setInitialSpecifications } = useProductSpecifications();
  const { freeItems, deletedFreeItemIds, addFreeItem, updateFreeItemName, updateFreeItemActive, handleFreeItemFileChange, removeFreeItem, setInitialFreeItems } = useProductFreeItems();
  const {
    optionGroups, variants, deletedOptionGroupIds, deletedOptionIds, deletedVariantIds,
    newOptionRefs, addOptionGroup, updateOptionGroupTitle, removeOptionGroup, addOption, 
    removeOption, generateVariants, updateVariant: localUpdateVariant, handleVariantFileChange, removeVariantImage, setInitialOptions
  } = useProductOptions(() => form.getValues('base_price'));

  // Initialize hooks if edit mode
  useEffect(() => {
    if (isEditMode && productData) {
      setInitialMedia(productData.medias || []);
      setInitialSpecifications(productData.specification || null);
      setInitialOptions(productData.option_groups || [], productData.variants || []);
      setInitialFreeItems(productData.free_items || []);
    }
  }, [isEditMode, productData, setInitialMedia, setInitialSpecifications, setInitialOptions, setInitialFreeItems]);

  // --- Save Orchestration ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSaving(true);

      // 1. Create/Update Product
      const specPayload = specifications.reduce((acc, curr) => {
        if (curr.key.trim() && curr.value.trim()) {
          acc[curr.key.trim()] = curr.value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      const productPayload = {
        ...values,
        description: values.description || undefined,
        detail: values.detail || undefined,
        category: Number(values.category),
        brand: Number(values.brand),
        specification: Object.keys(specPayload).length > 0 ? specPayload : undefined,
        discounts: values.discounts?.map(id => Number(id)) || [],
        tags: values.tags?.map(id => Number(id)) || [],
      };

      let product: Product;
      if (isEditMode) {
        product = await updateProduct({ id: productId!, data: productPayload }).unwrap();
      } else {
        product = await createProduct(productPayload).unwrap();
      }

      // 2. Process Deletions
      await Promise.all([
        ...deletedMediaIds.map(id => deleteMedia(id).unwrap()),
        ...deletedOptionGroupIds.map(id => deleteOptionGroup(id).unwrap()),
        ...deletedOptionIds.map(id => deleteOption(id).unwrap()),
        ...deletedVariantIds.map(id => deleteVariant(id).unwrap()),
        ...deletedFreeItemIds.map(id => deleteFreeItem(id).unwrap())
      ]);

      // 3. Upload New Media
      const newMediaFiles = mediaFiles.filter(m => !m.isExisting && m.file);
      await Promise.all(newMediaFiles.map(async (media, index) => {
        const formData = new FormData();
        formData.append('product', product.id.toString());
        formData.append('image', media.file!);
        if (index === 0 && mediaFiles.length === newMediaFiles.length) formData.append('is_thumbnail', 'true');
        await createMedia(formData).unwrap();
      }));

      // 4. Create/Update Option Groups & Options
      const backendOptionMap: Record<string, number> = {};

      for (const group of optionGroups) {
        if (group.options.length === 0) continue;
        
        let backendGroup: ProductOptionGroup;
        if (group.isExisting) {
          backendGroup = await updateOptionGroup({ id: Number(group.id), data: { title: group.title } }).unwrap();
        } else {
          backendGroup = await createOptionGroup({ product: product.id, title: group.title }).unwrap();
        }

        for (const option of group.options) {
          let backendOption: ProductOption;
          if (option.isExisting) {
            backendOption = await updateOption({ id: Number(option.id), data: { value: option.value } }).unwrap();
          } else {
            backendOption = await createOption({ group: backendGroup.id, value: option.value }).unwrap();
          }
          backendOptionMap[option.id] = backendOption.id;
        }
      }

      // 5. Create/Update Variants
      for (const variant of variants) {
        if (!variant.sku || !variant.price) continue;

        const formData = new FormData();
        formData.append('product', product.id.toString());
        formData.append('sku', variant.sku);
        formData.append('price', variant.price);
        formData.append('stock', variant.stock.toString());
        formData.append('is_active', variant.is_active ? 'true' : 'false');
        if (variant.file) {
          formData.append('image', variant.file);
        } else if (variant.imageRemoved && variant.isExisting) {
          formData.append('clear_image', 'true');
        }

        if (variant.isExisting) {
          await updateVariant({ id: Number(variant.id), data: formData }).unwrap();
          // Variant options are already tied, we don't need to re-map them for existing variants
        } else {
          const backendVariant = await createVariant(formData).unwrap();

          // Map local options to backend option IDs for this new variant
          for (const [groupTitle, optionValue] of Object.entries(variant.attributes)) {
            const localGroup = optionGroups.find(g => g.title === groupTitle);
            const localOption = localGroup?.options.find(o => o.value === optionValue);

            if (localOption && backendOptionMap[localOption.id]) {
              await createVariantOption({
                variant: backendVariant.id,
                option: backendOptionMap[localOption.id]
              }).unwrap();
            }
          }
        }
      }

      // 6. Create/Update Free Items
      for (const freeItem of freeItems) {
        if (freeItem.name.trim()) {
          const formData = new FormData();
          formData.append('product', product.id.toString());
          formData.append('name', freeItem.name.trim());
          formData.append('is_active', freeItem.is_active ? 'true' : 'false');
          if (freeItem.file) {
            formData.append('image', freeItem.file);
          }
          
          if (freeItem.isExisting) {
            await updateFreeItem({ id: Number(freeItem.id), data: formData }).unwrap();
          } else {
            await createFreeItem(formData).unwrap();
          }
        }
      }

      // Done
      router.push('/admin/products');

    } catch (error) {
      console.error('Failed to save product complex:', error);
      alert('Failed to save product. Please check console for errors.');
    } finally {
      setIsSaving(false);
    }
  };

  if ((isEditMode && isLoadingProduct) || isLoadingCategories || isLoadingBrands || isLoadingDiscounts || isLoadingProductTags) {
    return <div className="p-10 text-center">Loading product data...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BasicInfoSection categories={categories} brands={brands} discounts={discounts} productTags={productTags} />
        <SpecificationsSection
          specifications={specifications}
          addSpecification={addSpecification}
          updateSpecification={updateSpecification}
          removeSpecification={removeSpecification}
        />
        <MediaSection
          mediaFiles={mediaFiles}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          removeMedia={removeMedia}
        />
        <OptionsVariantsSection
          optionGroups={optionGroups}
          variants={variants}
          addOptionGroup={addOptionGroup}
          updateOptionGroupTitle={updateOptionGroupTitle}
          removeOptionGroup={removeOptionGroup}
          addOption={addOption}
          removeOption={removeOption}
          newOptionRefs={newOptionRefs}
          generateVariants={generateVariants}
          updateVariant={localUpdateVariant}
          handleVariantFileChange={handleVariantFileChange}
          removeVariantImage={removeVariantImage}
        />
        <FreeItemsSection
          freeItems={freeItems}
          addFreeItem={addFreeItem}
          updateFreeItemName={updateFreeItemName}
          updateFreeItemActive={updateFreeItemActive}
          handleFreeItemFileChange={handleFreeItemFileChange}
          removeFreeItem={removeFreeItem}
        />
        <div className="flex justify-end gap-4 pt-6 border-t mt-8">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
          <Button type="submit" disabled={isSaving} className="bg-primary-color hover:bg-primary-color/90 text-white px-8">
            {isSaving ? 'Saving Product...' : (isEditMode ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
