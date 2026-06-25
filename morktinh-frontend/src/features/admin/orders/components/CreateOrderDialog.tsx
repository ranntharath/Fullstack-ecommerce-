"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGetProductsQuery, useLazyGetProductQuery } from "@/features/admin/products/api/productsApi";
import type { Product } from "@/features/admin/products/types";
import { useCreateAdminOrderMutation, useGetAdminCustomersQuery } from "../api/ordersApi";
import type { PaymentMethod } from "../types";

type Line = { product: string; variant: string; quantity: number };
const emptyLine = (): Line => ({ product: "", variant: "", quantity: 1 });

export function CreateOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [kind, setKind] = useState<"customer" | "walkin">("customer");
  const [customer, setCustomer] = useState("");
  const [fields, setFields] = useState({ recipient_name: "", contact_email: "", phone: "", address_line1: "", address_line2: "", city: "", district: "", commune: "", notes: "", shipping_fee: "0.00", payment_method: "cash_on_delivery" as PaymentMethod });
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [details, setDetails] = useState<Record<number, Product>>({});
  const [error, setError] = useState("");
  const { data: customers = [] } = useGetAdminCustomersQuery();
  const { data: products = [] } = useGetProductsQuery();
  const [loadProduct] = useLazyGetProductQuery();
  const [createOrder, { isLoading }] = useCreateAdminOrderMutation();

  const estimatedSubtotal = useMemo(() => lines.reduce((sum, line) => {
    const product = details[Number(line.product)];
    if (!product) return sum;
    const variant = product.variants.find((item) => item.id === Number(line.variant));
    return sum + Number(variant?.variant_final_price ?? product.final_price) * line.quantity;
  }, 0), [details, lines]);

  const setField = (name: keyof typeof fields, value: string) => setFields((current) => ({ ...current, [name]: value }));
  const updateLine = (index: number, patch: Partial<Line>) => setLines((current) => current.map((line, i) => i === index ? { ...line, ...patch } : line));

  const chooseCustomer = (id: string) => {
    setCustomer(id);
    const selected = customers.find((item) => item.id === Number(id));
    if (selected) setFields((current) => ({ ...current, recipient_name: `${selected.first_name} ${selected.last_name}`.trim() || selected.email, contact_email: selected.email, phone: selected.phone ?? "" }));
  };

  const chooseProduct = async (index: number, id: string) => {
    updateLine(index, { product: id, variant: "" });
    if (id && !details[Number(id)]) {
      const product = await loadProduct(Number(id)).unwrap();
      setDetails((current) => ({ ...current, [product.id]: product }));
    }
  };

  const reset = () => {
    setKind("customer"); setCustomer(""); setFields({ recipient_name: "", contact_email: "", phone: "", address_line1: "", address_line2: "", city: "", district: "", commune: "", notes: "", shipping_fee: "0.00", payment_method: "cash_on_delivery" });
    setLines([emptyLine()]); setDetails({}); setError("");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    if (kind === "customer" && !customer) return setError("Choose a customer.");
    if (lines.some((line) => !line.product)) return setError("Choose a product for every item.");
    try {
      await createOrder({
        customer: kind === "customer" ? Number(customer) : null,
        ...fields,
        items: lines.map((line) => ({ product: Number(line.product), variant: line.variant ? Number(line.variant) : null, quantity: line.quantity })),
      }).unwrap();
      reset(); onOpenChange(false);
    } catch (reason) {
      const apiError = reason as { data?: Record<string, unknown> };
      setError(apiError.data ? Object.values(apiError.data).flat().join(" ") : "Could not create the order.");
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
      <form onSubmit={submit} className="space-y-5">
        <DialogHeader><DialogTitle>Create order</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(["customer", "walkin"] as const).map((value) => <button key={value} type="button" onClick={() => { setKind(value); if (value === "walkin") setCustomer(""); }} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${kind === value ? "bg-primary-color text-white shadow-sm" : "text-slate-500 hover:text-primary-color"}`}>{value === "customer" ? "Registered customer" : "Walk-in"}</button>)}
        </div>

        {kind === "customer" && <Field label="Customer"><select required value={customer} onChange={(e) => chooseCustomer(e.target.value)} className={selectClass}><option value="">Choose customer</option>{customers.map((item) => <option key={item.id} value={item.id}>{`${item.first_name} ${item.last_name}`.trim() || item.email} — {item.email}</option>)}</select></Field>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Recipient name"><Input required value={fields.recipient_name} onChange={(e) => setField("recipient_name", e.target.value)} /></Field>
          <Field label="Phone"><Input required value={fields.phone} onChange={(e) => setField("phone", e.target.value)} /></Field>
          <Field label="Contact email"><Input type="email" value={fields.contact_email} onChange={(e) => setField("contact_email", e.target.value)} /></Field>
          <Field label="Address"><Input required value={fields.address_line1} onChange={(e) => setField("address_line1", e.target.value)} /></Field>
          <Field label="Address line 2"><Input value={fields.address_line2} onChange={(e) => setField("address_line2", e.target.value)} /></Field>
          <Field label="City / Province"><Input required value={fields.city} onChange={(e) => setField("city", e.target.value)} /></Field>
          <Field label="District"><Input required value={fields.district} onChange={(e) => setField("district", e.target.value)} /></Field>
          <Field label="Commune"><Input required value={fields.commune} onChange={(e) => setField("commune", e.target.value)} /></Field>
        </div>

        <div className="space-y-3"><div className="flex items-center justify-between"><Label>Order items</Label><Button type="button" variant="outline" size="sm" className="border-primary-color/40 text-primary-color hover:bg-primary-color/10 hover:text-primary-color" onClick={() => setLines((current) => [...current, emptyLine()])}><Plus /> Add item</Button></div>
          {lines.map((line, index) => { const product = details[Number(line.product)]; const variants = product?.variants.filter((item) => item.is_active) ?? []; const hasNoVariants = Boolean(product) && variants.length === 0; return <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_90px_40px]">
            <select required value={line.product} onChange={(e) => void chooseProduct(index, e.target.value)} className={selectClass}><option value="">Product</option>{products.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name} (${item.final_price})</option>)}</select>
            <select value={line.variant} required={variants.length > 0} disabled={variants.length === 0} onChange={(e) => updateLine(index, { variant: e.target.value })} className={`${selectClass} ${hasNoVariants ? "disabled:border-primary-color/40 disabled:bg-primary-color/5 disabled:font-medium disabled:text-primary-color disabled:opacity-100" : ""}`}><option value="">{variants.length ? "Choose variant" : "No variant"}</option>{variants.map((item) => <option key={item.id} value={item.id}>{item.sku} · {Object.values(item.attributes).join(" / ")} · ${item.variant_final_price} ({item.stock})</option>)}</select>
            <Input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(index, { quantity: Math.max(1, Number(e.target.value)) })} />
            <Button type="button" variant="ghost" size="icon" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((_, i) => i !== index))}><Trash2 className="text-red-500" /></Button>
          </div>; })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2"><Field label="Payment"><select value={fields.payment_method} onChange={(e) => setField("payment_method", e.target.value)} className={selectClass}><option value="cash_on_delivery">Cash on delivery</option><option value="bank_transfer">Bank transfer</option><option value="khqr">KHQR</option></select></Field><Field label="Shipping fee"><Input type="number" min="0" step="0.01" required value={fields.shipping_fee} onChange={(e) => setField("shipping_fee", e.target.value)} /></Field></div>
        <Field label="Notes"><Textarea value={fields.notes} onChange={(e) => setField("notes", e.target.value)} /></Field>
        <div className="flex justify-end text-sm font-semibold">Estimated total: ${(estimatedSubtotal + Number(fields.shipping_fee || 0)).toFixed(2)}</div>
        {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={isLoading} className="bg-primary-color text-white hover:bg-primary-color/90">{isLoading ? "Creating…" : "Create order"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}

const selectClass = "h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-primary-color disabled:bg-slate-50";
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>; }
