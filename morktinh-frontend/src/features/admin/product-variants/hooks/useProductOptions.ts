import { type ChangeEvent, useState, useRef, useCallback } from 'react';
import { ProductOptionGroup as ApiProductOptionGroup } from '@/features/admin/product-options/types';
import { ProductVariant as ApiProductVariant } from '@/features/admin/product-variants/types';
import { getImageUrl } from '@/lib/image-utils';

export interface LocalOption {
  id: string; // can be number as string if existing, or timestamp if new
  value: string;
  isExisting?: boolean;
}

export interface LocalOptionGroup {
  id: string; // can be number as string if existing, or timestamp if new
  title: string;
  options: LocalOption[];
  isExisting?: boolean;
}

export interface LocalVariant {
  id: string; // can be number as string if existing, or timestamp if new
  sku: string;
  price: string;
  stock: number;
  file: File | null;
  preview: string | null;
  imageRemoved: boolean;
  is_active: boolean;
  attributes: Record<string, string>;
  isExisting?: boolean;
}

export function useProductOptions(getBasePrice: () => string) {
  const [optionGroups, setOptionGroups] = useState<LocalOptionGroup[]>([]);
  const [variants, setVariants] = useState<LocalVariant[]>([]);
  
  const [deletedOptionGroupIds, setDeletedOptionGroupIds] = useState<number[]>([]);
  const [deletedOptionIds, setDeletedOptionIds] = useState<number[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);

  const newOptionRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const setInitialOptions = useCallback((apiGroups: ApiProductOptionGroup[], apiVariants: ApiProductVariant[]) => {
    const groups: LocalOptionGroup[] = apiGroups.map(g => ({
      id: g.id.toString(),
      title: g.title,
      isExisting: true,
      options: g.options.map(o => ({
        id: o.id.toString(),
        value: o.value,
        isExisting: true
      }))
    }));

    const mappedVariants: LocalVariant[] = apiVariants.map(v => ({
      id: v.id.toString(),
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      file: null,
      preview: getImageUrl(v.image),
      imageRemoved: false,
      is_active: v.is_active,
      attributes: v.attributes,
      isExisting: true
    }));

    setOptionGroups(groups);
    setVariants(mappedVariants);
    setDeletedOptionGroupIds([]);
    setDeletedOptionIds([]);
    setDeletedVariantIds([]);
  }, []);

  const addOptionGroup = () => {
    setOptionGroups(prev => [...prev, { id: Date.now().toString(), title: '', options: [], isExisting: false }]);
  };

  const updateOptionGroupTitle = (groupId: string, newTitle: string) => {
    setOptionGroups(prev => prev.map(g => g.id === groupId ? { ...g, title: newTitle } : g));
  };

  const removeOptionGroup = (groupId: string) => {
    setOptionGroups(prev => {
      const groupToRemove = prev.find(g => g.id === groupId);
      if (groupToRemove?.isExisting) {
        setDeletedOptionGroupIds(del => [...del, Number(groupId)]);
      }

      const newGroups = prev.filter(g => g.id !== groupId);
      if (newGroups.filter(g => g.options.length > 0).length === 0) {
        // If we clear variants, mark existing ones as deleted
        variants.forEach(v => {
          if (v.isExisting) setDeletedVariantIds(del => [...del, Number(v.id)]);
        });
        setVariants([]);
      }
      return newGroups;
    });
  };

  const addOption = (groupId: string) => {
    const inputRef = newOptionRefs.current[groupId];
    const value = inputRef?.value.trim();
    if (!value) return;

    setOptionGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, options: [...g.options, { id: Date.now().toString(), value, isExisting: false }] };
      }
      return g;
    }));
    if (inputRef) inputRef.value = '';
  };

  const removeOption = (groupId: string, optionId: string) => {
    setOptionGroups(prev => {
      const newGroups = prev.map(g => {
        if (g.id === groupId) {
          const optionToRemove = g.options.find(o => o.id === optionId);
          if (optionToRemove?.isExisting) {
            setDeletedOptionIds(del => [...del, Number(optionId)]);
          }
          return { ...g, options: g.options.filter(o => o.id !== optionId) };
        }
        return g;
      });
      if (newGroups.filter(g => g.options.length > 0).length === 0) {
        variants.forEach(v => {
          if (v.isExisting) setDeletedVariantIds(del => [...del, Number(v.id)]);
        });
        setVariants([]);
      }
      return newGroups;
    });
  };

  const generateVariants = () => {
    if (optionGroups.length === 0) return;

    const cartesian = (arrays: LocalOption[][]): LocalOption[][] => {
      return arrays.reduce<LocalOption[][]>((a, b) => a.flatMap(d => b.map(e => [...d, e])), [[]]);
    };

    const validGroups = optionGroups.filter(g => g.options.length > 0);
    if (validGroups.length === 0) return;

    const combinations = cartesian(validGroups.map(g => g.options));

    // When we generate matrix, we wipe out the old matrix. 
    // Mark old existing variants as deleted.
    variants.forEach(v => {
      if (v.isExisting) setDeletedVariantIds(del => [...del, Number(v.id)]);
    });

    const newVariants: LocalVariant[] = combinations.map((combo, index) => {
      const attributes: Record<string, string> = {};
      validGroups.forEach((g, i) => {
        attributes[g.title] = combo[i].value;
      });

      const defaultSku = `SKU-${Date.now()}-${index}`;

      return {
        id: Date.now().toString() + index,
        sku: defaultSku,
        price: getBasePrice() || '0',
        stock: 0,
        file: null,
        preview: null,
        imageRemoved: false,
        is_active: true,
        attributes,
        isExisting: false
      };
    });

    setVariants(newVariants);
  };

  const updateVariant = (variantId: string, field: keyof LocalVariant, value: string | number | boolean) => {
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, [field]: value } : v));
  };

  const handleVariantFileChange = (variantId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, file, preview, imageRemoved: false } : v));
    e.target.value = '';
  };

  const removeVariantImage = (variantId: string) => {
    setVariants(prev => prev.map(v => {
      if (v.id !== variantId) return v;

      if (v.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(v.preview);
      }

      return {
        ...v,
        file: null,
        preview: null,
        imageRemoved: true
      };
    }));
  };

  return {
    optionGroups,
    variants,
    deletedOptionGroupIds,
    deletedOptionIds,
    deletedVariantIds,
    newOptionRefs,
    addOptionGroup,
    updateOptionGroupTitle,
    removeOptionGroup,
    addOption,
    removeOption,
    generateVariants,
    updateVariant,
    handleVariantFileChange,
    removeVariantImage,
    setInitialOptions
  };
}
