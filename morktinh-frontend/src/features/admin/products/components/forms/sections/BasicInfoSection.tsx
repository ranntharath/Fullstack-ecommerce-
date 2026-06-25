import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface Discount {
  id: number;
  name: string;
  discount_type: 'percent' | 'fixed';
  value: string;
  is_global: boolean;
  is_active: boolean;
}

interface ProductTag {
  id: number;
  name: string;
  is_active: boolean;
}

interface BasicInfoSectionProps {
  categories: Category[];
  brands: Brand[];
  discounts: Discount[];
  productTags: ProductTag[];
}

export default function BasicInfoSection({ categories, brands, discounts, productTags }: BasicInfoSectionProps) {
  const { control } = useFormContext();
  const activeProductDiscounts = discounts.filter(d => !d.is_global && d.is_active);
  const activeProductTags = productTags.filter(tag => tag.is_active);

  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-slate-500">Add the main details for the product.</p>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Product Name</FormLabel>
              <FormControl><Input placeholder="e.g. iPhone 15 Pro" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="base_price" render={({ field }) => (
            <FormItem><FormLabel>Base Price ($)</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="999.99" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={control} name="category" render={({ field }) => (
            <FormItem><FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={control} name="brand" render={({ field }) => (
            <FormItem><FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select a brand" /></SelectTrigger></FormControl>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Short Description</FormLabel>
            <FormControl><Textarea className="resize-none" {...field} value={field.value || ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={control} name="tags" render={({ field }) => (
          <FormItem>
            <div className="mb-3">
              <FormLabel className="text-base">Product Tags</FormLabel>
              <p className="text-sm text-slate-500">Choose tags from the Product Tags page.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {activeProductTags.map(tag => {
                const selected = field.value?.includes(tag.id.toString());

                return (
                  <label key={tag.id} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${selected ? 'border-primary-color bg-primary-color/5' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-color focus:ring-primary-color border-slate-300"
                      checked={selected || false}
                      onChange={(event) => {
                        const currentValue = field.value || [];
                        const tagId = tag.id.toString();

                        field.onChange(
                          event.target.checked
                            ? [...currentValue, tagId]
                            : currentValue.filter((id: string) => id !== tagId)
                        );
                      }}
                    />
                    <span className="text-sm font-medium text-slate-700">{tag.name}</span>
                  </label>
                );
              })}
              {activeProductTags.length === 0 && (
                <p className="text-sm text-slate-400 italic">No active tags available. Create tags in the Product Tags page.</p>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex flex-row items-center gap-10">
          <FormField control={control} name="is_active" render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="text-base cursor-pointer">Active Status</FormLabel>
            </FormItem>
          )} />
          <FormField control={control} name="is_feature" render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-3 space-y-0">
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="text-base cursor-pointer">Featured Product</FormLabel>
            </FormItem>
          )} />
        </div>

        <FormField control={control} name="discounts" render={({ field }) => (
          <FormItem className="mt-8 pt-6 border-t">
            <div className="mb-4">
              <FormLabel className="text-base">Product Discounts</FormLabel>
              <p className="text-sm text-slate-500">Select one product discount. No product discount means no discount unless a global discount is set to override.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${!field.value?.length ? 'border-primary-color bg-primary-color/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <input
                  type="radio"
                  name={field.name}
                  className="w-4 h-4 text-primary-color focus:ring-primary-color border-slate-300"
                  checked={!field.value?.length}
                  onChange={() => field.onChange([])}
                />
                <span className="text-sm font-medium text-slate-700">No product discount</span>
              </label>
              {activeProductDiscounts.map(discount => {
                const isSelected = field.value?.includes(discount.id.toString());
                return (
                  <label key={discount.id} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer transition-colors ${isSelected ? 'border-primary-color bg-primary-color/5' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name={field.name}
                      className="w-4 h-4 text-primary-color focus:ring-primary-color border-slate-300"
                      checked={isSelected || false}
                      onChange={() => field.onChange([discount.id.toString()])}
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {discount.name} ({discount.discount_type === 'percent' ? `${discount.value}%` : `$${discount.value}`})
                    </span>
                  </label>
                );
              })}
              {activeProductDiscounts.length === 0 && (
                <p className="text-sm text-slate-400 italic">No active product-specific discounts available. Create one in the Discounts page.</p>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </div>
  );
}
