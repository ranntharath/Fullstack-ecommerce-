import { useState, useCallback } from 'react';
import { ProductFreeItem as ApiProductFreeItem } from '../types';

export interface FreeItem {
  id: string; // number as string if existing
  name: string;
  file: File | null;
  preview: string | null;
  is_active: boolean;
  isExisting?: boolean;
}

export function useProductFreeItems() {
  const [freeItems, setFreeItems] = useState<FreeItem[]>([]);
  const [deletedFreeItemIds, setDeletedFreeItemIds] = useState<number[]>([]);

  const setInitialFreeItems = useCallback((apiFreeItems: ApiProductFreeItem[]) => {
    const items: FreeItem[] = apiFreeItems.map(item => ({
      id: item.id.toString(),
      name: item.name,
      file: null,
      preview: item.image,
      is_active: item.is_active,
      isExisting: true
    }));
    setFreeItems(items);
    setDeletedFreeItemIds([]);
  }, []);

  const addFreeItem = () => {
    setFreeItems(prev => [...prev, { id: Date.now().toString(), name: '', file: null, preview: null, is_active: true, isExisting: false }]);
  };

  const updateFreeItemName = (id: string, name: string) => {
    setFreeItems(prev => prev.map(item => item.id === id ? { ...item, name } : item));
  };

  const updateFreeItemActive = (id: string, isActive: boolean) => {
    setFreeItems(prev => prev.map(item => item.id === id ? { ...item, is_active: isActive } : item));
  };

  const handleFreeItemFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setFreeItems(prev => prev.map(item => {
        if (item.id === id) {
          if (item.preview && !item.isExisting) URL.revokeObjectURL(item.preview);
          return { ...item, file, preview };
        }
        return item;
      }));
    }
  };

  const removeFreeItem = (id: string) => {
    setFreeItems(prev => {
      const itemToRemove = prev.find(i => i.id === id);
      if (itemToRemove?.isExisting) {
        setDeletedFreeItemIds(del => [...del, Number(id)]);
      }

      return prev.filter(item => {
        if (item.id === id && item.preview && !item.isExisting) {
          URL.revokeObjectURL(item.preview);
        }
        return item.id !== id;
      });
    });
  };

  return {
    freeItems,
    deletedFreeItemIds,
    addFreeItem,
    updateFreeItemName,
    updateFreeItemActive,
    handleFreeItemFileChange,
    removeFreeItem,
    setInitialFreeItems
  };
}
