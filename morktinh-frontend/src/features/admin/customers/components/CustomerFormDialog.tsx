"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCustomerMutation, useUpdateCustomerMutation } from "../api/customersApi";
import type { AdminCustomer, CustomerFormValues } from "../types";

const emptyForm: CustomerFormValues = {
  email: "",
  first_name: "",
  last_name: "",
  phone: "",
  password: "",
  password_confirm: "",
  is_active: true,
  is_email_verified: false,
};

function getErrorMessage(reason: unknown) {
  const error = reason as { data?: Record<string, string | string[]> };
  if (!error.data) return "Could not save the customer.";
  return Object.entries(error.data)
    .flatMap(([field, messages]) => `${field.replaceAll("_", " ")}: ${Array.isArray(messages) ? messages.join(" ") : messages}`)
    .join(" ");
}

export function CustomerFormDialog({ customer, open, onOpenChange }: { customer?: AdminCustomer | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState<CustomerFormValues>(emptyForm);
  const [error, setError] = useState("");
  const [createCustomer, createState] = useCreateCustomerMutation();
  const [updateCustomer, updateState] = useUpdateCustomerMutation();
  const isEditing = Boolean(customer);
  const isLoading = createState.isLoading || updateState.isLoading;

  useEffect(() => {
    if (!open) return;
    setError("");
    setForm(customer ? {
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone ?? "",
      password: "",
      password_confirm: "",
      is_active: customer.is_active,
      is_email_verified: customer.is_email_verified,
    } : emptyForm);
  }, [customer, open]);

  const setField = <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      if (customer) {
        const body = { ...form };
        if (!body.password) {
          delete body.password;
          delete body.password_confirm;
        }
        await updateCustomer({ id: customer.id, body }).unwrap();
      } else {
        await createCustomer(form).unwrap();
      }
      onOpenChange(false);
    } catch (reason) {
      setError(getErrorMessage(reason));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && onOpenChange(nextOpen)}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit customer" : "Add customer"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name"><Input value={form.first_name} onChange={(event) => setField("first_name", event.target.value)} /></Field>
            <Field label="Last name"><Input value={form.last_name} onChange={(event) => setField("last_name", event.target.value)} /></Field>
            <Field label="Email"><Input type="email" required value={form.email} onChange={(event) => setField("email", event.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(event) => setField("phone", event.target.value)} /></Field>
            <Field label={isEditing ? "New password (optional)" : "Password"}><Input type="password" required={!isEditing} minLength={8} value={form.password} onChange={(event) => setField("password", event.target.value)} /></Field>
            <Field label="Confirm password"><Input type="password" required={!isEditing || Boolean(form.password)} minLength={8} value={form.password_confirm} onChange={(event) => setField("password_confirm", event.target.value)} /></Field>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
            <CheckField label="Active account" checked={form.is_active} onChange={(checked) => setField("is_active", checked)} />
            <CheckField label="Email verified" checked={form.is_email_verified} onChange={(checked) => setField("is_email_verified", checked)} />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isLoading} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-primary-color text-white hover:bg-primary-color/90">{isLoading ? "Saving..." : isEditing ? "Save changes" : "Add customer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function CheckField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-primary-color" />{label}</label>;
}
