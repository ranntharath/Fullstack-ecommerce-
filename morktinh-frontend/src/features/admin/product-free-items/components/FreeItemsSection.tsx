/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, UploadCloud } from 'lucide-react';

interface FreeItem {
  id: string;
  name: string;
  file: File | null;
  preview: string | null;
  is_active: boolean;
}

interface FreeItemsSectionProps {
  freeItems: FreeItem[];
  addFreeItem: () => void;
  updateFreeItemName: (id: string, name: string) => void;
  updateFreeItemActive: (id: string, isActive: boolean) => void;
  handleFreeItemFileChange: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFreeItem: (id: string) => void;
}

export default function FreeItemsSection({
  freeItems,
  addFreeItem,
  updateFreeItemName,
  updateFreeItemActive,
  handleFreeItemFileChange,
  removeFreeItem
}: FreeItemsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Free Items</h2>
          <p className="text-sm text-slate-500">Add promotional free items for this product.</p>
        </div>
        <Button type="button" onClick={addFreeItem} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Free Item
        </Button>
      </div>

      <div className="space-y-4">
        {freeItems.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No free items added yet.</p>
        ) : (
          freeItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-center border p-3 rounded-md bg-slate-50 transition-colors hover:border-slate-300">
              <div
                className="flex-shrink-0 cursor-pointer group"
                onClick={() => document.getElementById(`free-item-img-${item.id}`)?.click()}
                title="Upload Image (Optional)"
              >
                {item.preview ? (
                  <div className="relative w-12 h-12 border rounded-md overflow-hidden bg-white">
                    <img src={item.preview} alt="preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-12 h-12 border border-dashed border-slate-300 rounded-md flex items-center justify-center bg-white group-hover:bg-slate-100 transition-colors">
                    <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-primary-color transition-colors" />
                  </div>
                )}
                <input
                  type="file"
                  id={`free-item-img-${item.id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFreeItemFileChange(item.id, e)}
                />
              </div>

              <div className="flex-1">
                <Input
                  placeholder="Item name (e.g. Free Screen Protector)"
                  value={item.name}
                  onChange={(e) => updateFreeItemName(item.id, e.target.value)}
                  className="bg-white"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => updateFreeItemActive(item.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-primary-color"
                />
                Active
              </label>

              <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0" onClick={() => removeFreeItem(item.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
