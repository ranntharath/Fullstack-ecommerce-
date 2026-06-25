import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateDiscountMutation } from '../api/discountsApi';
import { Discount } from '../types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  discount_type: z.enum(['percent', 'fixed']),
  value: z.string().min(1, { message: 'Value is required.' }),
  is_global: z.boolean(),
  override_product_discount: z.boolean(),
  is_active: z.boolean(),
  start_date: z.string().min(1, { message: 'Start date is required.' }),
  end_date: z.string().min(1, { message: 'End date is required.' }),
}).refine(data => new Date(data.start_date) <= new Date(data.end_date), {
  message: "End date cannot be earlier than start date.",
  path: ["end_date"],
});

const toLocalDateTimeInputValue = (date: string) => {
  const value = new Date(date);
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;

  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
};

const toUtcIso = (localDateTime: string) => new Date(localDateTime).toISOString();

interface EditDiscountModalProps {
  discount: Discount | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditDiscountModal({ discount, isOpen, onClose }: EditDiscountModalProps) {
  const [updateDiscount, { isLoading }] = useUpdateDiscountMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      discount_type: 'percent',
      value: '',
      is_global: false,
      override_product_discount: false,
      is_active: true,
      start_date: '',
      end_date: '',
    },
    values: discount ? {
      name: discount.name,
      discount_type: discount.discount_type,
      value: discount.value,
      is_global: discount.is_global,
      override_product_discount: discount.override_product_discount,
      is_active: discount.is_active,
      start_date: discount.start_date ? toLocalDateTimeInputValue(discount.start_date) : '',
      end_date: discount.end_date ? toLocalDateTimeInputValue(discount.end_date) : '',
    } : undefined
  });

  const isGlobal = useWatch({
    control: form.control,
    name: 'is_global',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!discount) return;
    try {
      const payload = {
        ...values,
        override_product_discount: values.is_global ? values.override_product_discount : false,
        start_date: toUtcIso(values.start_date),
        end_date: toUtcIso(values.end_date),
      };
      await updateDiscount({ id: discount.id, data: payload }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update discount:', error);
      alert('Failed to update discount. Please check the console.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-sm bg-white border-0 shadow-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-800">Edit Discount</DialogTitle>
          <DialogDescription className="text-slate-500 mt-1.5">
            Modify the details of this discount.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">Discount Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Summer Sale 2026" className="bg-slate-50 border-slate-200 focus-visible:ring-primary-color" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="discount_type" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Discount Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} key={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="percent">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Value</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g. 15.00" className="bg-slate-50 border-slate-200 focus-visible:ring-primary-color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Start Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="bg-slate-50 border-slate-200 focus-visible:ring-primary-color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="end_date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">End Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="bg-slate-50 border-slate-200 focus-visible:ring-primary-color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md border border-slate-100">
              <FormField control={form.control} name="is_global" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-slate-700">Global Discount</FormLabel>
                    <FormDescription className="text-xs text-slate-500">Apply to all products</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between border-l pl-4 border-slate-200">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-semibold text-slate-700">Active</FormLabel>
                    <FormDescription className="text-xs text-slate-500">Enable this discount</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />

              {isGlobal && (
                <FormField control={form.control} name="override_product_discount" render={({ field }) => (
                  <FormItem className="col-span-2 flex flex-row items-center justify-between border-t pt-4 border-slate-200">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold text-slate-700">Override Product Discounts</FormLabel>
                      <FormDescription className="text-xs text-slate-500">Global discount wins over product discounts</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary-color hover:bg-primary-color/90 text-white font-medium">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
