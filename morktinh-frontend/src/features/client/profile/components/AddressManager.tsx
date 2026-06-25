"use client";

import { FormEvent, useState } from "react";
import { Home, MapPin, Pencil, Plus, Save, Trash2 } from "lucide-react";
import ConfirmDeleteModal from "@/components/common/admin/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerAddress, CustomerAddressRequest } from "@/features/client/profile/types";

const emptyAddress: CustomerAddressRequest = {
  recipient_name: "",
  address_line1: "",
  address_line2: "",
  phone: "",
  city: "",
  district: "",
  commune: "",
};

interface AddressManagerProps {
  addresses: CustomerAddress[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onCreate: (data: CustomerAddressRequest) => Promise<void>;
  onUpdate: (id: number, data: CustomerAddressRequest) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function AddressManager({
  addresses,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: AddressManagerProps) {
  const [addressForm, setAddressForm] = useState<CustomerAddressRequest>(emptyAddress);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<CustomerAddress | null>(null);

  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingAddressId) {
      await onUpdate(editingAddressId, addressForm);
    } else {
      await onCreate(addressForm);
    }

    resetAddressForm();
  };

  const startEditAddress = (address: CustomerAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      recipient_name: address.recipient_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      phone: address.phone,
      city: address.city,
      district: address.district,
      commune: address.commune,
    });
  };

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    await onDelete(addressToDelete.id);
    if (editingAddressId === addressToDelete.id) {
      resetAddressForm();
    }
    setAddressToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-color" />
            Delivery Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient name</Label>
                <Input
                  id="recipient-name"
                  required
                  value={addressForm.recipient_name}
                  onChange={(event) => setAddressForm((current) => ({ ...current, recipient_name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address-phone">Phone</Label>
                <Input
                  id="address-phone"
                  required
                  value={addressForm.phone}
                  onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-line-1">Address line 1</Label>
              <Input
                id="address-line-1"
                required
                value={addressForm.address_line1}
                onChange={(event) => setAddressForm((current) => ({ ...current, address_line1: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address-line-2">Address line 2</Label>
              <Input
                id="address-line-2"
                value={addressForm.address_line2 || ""}
                onChange={(event) => setAddressForm((current) => ({ ...current, address_line2: event.target.value }))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  required
                  value={addressForm.city}
                  onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  required
                  value={addressForm.district}
                  onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune</Label>
                <Input
                  id="commune"
                  required
                  value={addressForm.commune}
                  onChange={(event) => setAddressForm((current) => ({ ...current, commune: event.target.value }))}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary-color text-white hover:bg-primary-color/90"
              >
                {editingAddressId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingAddressId ? "Update Address" : "Add Address"}
              </Button>
              {editingAddressId && (
                <Button type="button" variant="outline" onClick={resetAddressForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center">
            <Home className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <div className="text-sm font-semibold text-slate-700">No addresses yet</div>
            <p className="mt-1 text-sm text-slate-400">Add one above for faster checkout later.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-bold text-slate-950">{address.recipient_name}</div>
                  <div className="mt-1 text-sm text-slate-500">{address.phone}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700">
                    {address.address_line1}
                    {address.address_line2 ? `, ${address.address_line2}` : ""}
                    <br />
                    {address.commune}, {address.district}, {address.city}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEditAddress(address)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => setAddressToDelete(address)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDeleteModal
        open={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleConfirmDeleteAddress}
        isLoading={isDeleting}
        title="Delete address?"
        description={
          addressToDelete
            ? `Delete ${addressToDelete.recipient_name}'s address? This action cannot be undone.`
            : "Delete this address? This action cannot be undone."
        }
      />
    </>
  );
}
