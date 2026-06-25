import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { ImageIcon, Plus, Trash2, UploadCloud, X } from 'lucide-react';

interface LocalOption {
  id: string;
  value: string;
}

interface LocalOptionGroup {
  id: string;
  title: string;
  options: LocalOption[];
}

interface LocalVariant {
  id: string;
  sku: string;
  price: string;
  stock: number;
  file: File | null;
  preview: string | null;
  imageRemoved: boolean;
  is_active: boolean;
  attributes: Record<string, string>;
}

interface OptionsVariantsSectionProps {
  optionGroups: LocalOptionGroup[];
  variants: LocalVariant[];
  addOptionGroup: () => void;
  updateOptionGroupTitle: (groupId: string, newTitle: string) => void;
  removeOptionGroup: (groupId: string) => void;
  addOption: (groupId: string) => void;
  removeOption: (groupId: string, optionId: string) => void;
  newOptionRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  generateVariants: () => void;
  updateVariant: (variantId: string, field: keyof LocalVariant, value: string | number | boolean) => void;
  handleVariantFileChange: (variantId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  removeVariantImage: (variantId: string) => void;
}

export default function OptionsVariantsSection({
  optionGroups,
  variants,
  addOptionGroup,
  updateOptionGroupTitle,
  removeOptionGroup,
  addOption,
  removeOption,
  newOptionRefs,
  generateVariants,
  updateVariant,
  handleVariantFileChange,
  removeVariantImage
}: OptionsVariantsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Options & Variants</h2>
          <p className="text-sm text-slate-500">Create option groups (like Color) to automatically generate variants.</p>
        </div>
        <Button type="button" onClick={addOptionGroup} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" /> Add Group
        </Button>
      </div>

      <div className="space-y-6 mb-8">
        {optionGroups.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center text-gray-500">
            <p>No option groups added yet. Click &quot;Add Group&quot; to start.</p>
          </div>
        ) : optionGroups.map((group) => (
          <div key={group.id} className="border rounded-md p-4 bg-slate-50">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1 max-w-sm">
                <FormLabel className="text-xs text-slate-500 mb-1 block">Group Name</FormLabel>
                <Input
                  placeholder="e.g. Color, Size, Material"
                  value={group.title}
                  onChange={(e) => updateOptionGroupTitle(group.id, e.target.value)}
                />
              </div>
              <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-5" onClick={() => removeOptionGroup(group.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-2">
              <FormLabel className="text-xs text-slate-500 mb-2 block">Option Values</FormLabel>
              <div className="flex flex-wrap gap-2 mb-4">
                {group.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-1 bg-white border px-3 py-1.5 rounded-md text-sm shadow-sm">
                    {option.value}
                    <button type="button" onClick={() => removeOption(group.id, option.id)} className="ml-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New option (e.g. Red)" ref={(el) => { newOptionRefs.current[group.id] = el; }} className="max-w-[200px] h-9 text-sm" />
                <Button type="button" onClick={() => addOption(group.id)} size="sm" variant="outline" className="h-9">Add Value</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {optionGroups.length > 0 && (
        <div className="mb-6 pt-4 border-t">
          <Button type="button" onClick={generateVariants} className="bg-primary-color hover:bg-primary-color/90 text-white">
            Generate Variants Matrix
          </Button>
        </div>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-left text-sm text-slate-500">
                <th className="p-3 font-medium">Variant</th>
                <th className="p-3 font-medium w-24">Image</th>
                <th className="p-3 font-medium w-48">SKU</th>
                <th className="p-3 font-medium w-32">Price ($)</th>
                <th className="p-3 font-medium w-32">Stock</th>
                <th className="p-3 font-medium w-28">Active</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(variant.attributes).map(([key, val]) => (
                        <span key={key} className="bg-white border rounded px-2 py-0.5 text-xs text-slate-600 shadow-sm">{val}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="relative h-14 w-14">
                      <button
                        type="button"
                        onClick={() => document.getElementById(`variant-img-${variant.id}`)?.click()}
                        className="group flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white transition-colors hover:border-primary-color hover:bg-slate-50"
                        title="Upload variant image"
                      >
                        {variant.preview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variant.preview}
                            alt={`${variant.sku || 'Variant'} preview`}
                            className="h-full w-full object-cover transition-opacity group-hover:opacity-70"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-0.5 text-slate-400 group-hover:text-primary-color">
                            <UploadCloud className="h-4 w-4" />
                            <ImageIcon className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                      {variant.preview && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeVariantImage(variant.id);
                          }}
                          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
                          title="Remove variant image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      id={`variant-img-${variant.id}`}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleVariantFileChange(variant.id, e)}
                    />
                  </td>
                  <td className="p-3">
                    <Input value={variant.sku} onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)} className="h-8 text-sm" />
                  </td>
                  <td className="p-3">
                    <Input type="number" step="0.01" value={variant.price} onChange={(e) => updateVariant(variant.id, 'price', e.target.value)} className="h-8 text-sm" />
                  </td>
                  <td className="p-3">
                    <Input type="number" value={variant.stock} onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))} className="h-8 text-sm" />
                  </td>
                  <td className="p-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={variant.is_active}
                        onChange={(e) => updateVariant(variant.id, 'is_active', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 accent-primary-color"
                      />
                      Active
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
