import { Mail, MapPin, Package, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminOrder } from '../types';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function OrderDetailsDialog({ order, onClose }: { order: AdminOrder | null; onClose: () => void }) {
  if (!order) return null;
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5"><DialogTitle>Order #{String(order.id).padStart(5, '0')}</DialogTitle><p className="text-xs text-slate-400">Placed {new Date(order.created_at).toLocaleString()}</p></DialogHeader>
        <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">
          <section><h3 className="mb-3 text-sm font-semibold text-slate-900">Customer</h3><div className="space-y-2 rounded-lg bg-slate-50 p-4 text-sm"><p className="font-semibold text-slate-800">{order.customer_name}</p><p className="flex items-center gap-2 text-slate-500"><Mail className="size-4" />{order.customer_email}</p><p className="flex items-center gap-2 text-slate-500"><Phone className="size-4" />{order.phone}</p></div></section>
          <section><h3 className="mb-3 text-sm font-semibold text-slate-900">Shipping address</h3><div className="flex gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-600"><MapPin className="mt-0.5 size-4 shrink-0" /><p>{order.recipient_name}<br />{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}<br />{order.commune}, {order.district}, {order.city}</p></div></section>
        </div>
        <section className="px-6 pb-6"><h3 className="mb-3 text-sm font-semibold text-slate-900">Items</h3><div className="divide-y divide-slate-100 rounded-lg border border-slate-200">{order.items.map((item) => <div key={item.id} className="flex items-center gap-3 p-4"><div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Package className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.product_name}</p><p className="text-xs text-slate-400">{item.variant_sku || 'Standard'} · Qty {item.quantity}</p></div><p className="text-sm font-semibold text-slate-900">{currency.format(Number(item.line_total))}</p></div>)}</div></section>
        <section className="mx-6 mb-6 rounded-lg bg-slate-900 p-4 text-sm text-white"><div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{currency.format(Number(order.subtotal))}</span></div><div className="mt-2 flex justify-between text-slate-300"><span>Shipping</span><span>{currency.format(Number(order.shipping_fee))}</span></div><div className="mt-3 flex justify-between border-t border-slate-700 pt-3 text-base font-bold"><span>Total</span><span>{currency.format(Number(order.total))}</span></div><p className="mt-3 text-xs capitalize text-slate-400">Payment: {order.payment_method.replaceAll('_', ' ')}{order.payment_status ? ` · ${order.payment_status}` : ''}</p></section>
      </DialogContent>
    </Dialog>
  );
}
