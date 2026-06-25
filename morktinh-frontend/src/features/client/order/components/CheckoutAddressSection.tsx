import { Dispatch, SetStateAction } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerAddress, CustomerAddressRequest } from "@/features/client/profile/types";

interface CheckoutAddressSectionProps {
  addresses: CustomerAddress[];
  effectiveAddressMode: "saved" | "new";
  effectiveSelectedAddressId: number | null;
  isCreatingOrder: boolean;
  isLoadingAddresses: boolean;
  newAddress: CustomerAddressRequest;
  saveAddress: boolean;
  setAddressMode: (mode: "saved" | "new") => void;
  setNewAddress: Dispatch<SetStateAction<CustomerAddressRequest>>;
  setSaveAddress: (save: boolean) => void;
  setSelectedAddressId: (id: number) => void;
}

export function CheckoutAddressSection({
  addresses,
  effectiveAddressMode,
  effectiveSelectedAddressId,
  isCreatingOrder,
  isLoadingAddresses,
  newAddress,
  saveAddress,
  setAddressMode,
  setNewAddress,
  setSaveAddress,
  setSelectedAddressId,
}: CheckoutAddressSectionProps) {
  const hasSavedAddresses = addresses.length > 0;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary-color" />
        <h2 className="text-lg font-bold text-slate-950">Delivery Address</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:w-80">
        <Button
          type="button"
          variant={effectiveAddressMode === "saved" ? "default" : "outline"}
          disabled={!hasSavedAddresses || isCreatingOrder}
          onClick={() => setAddressMode("saved")}
          className={effectiveAddressMode === "saved" ? "bg-primary-color text-white hover:bg-primary-color/90" : ""}
        >
          Existing
        </Button>
        <Button
          type="button"
          variant={effectiveAddressMode === "new" ? "default" : "outline"}
          disabled={isCreatingOrder}
          onClick={() => setAddressMode("new")}
          className={effectiveAddressMode === "new" ? "bg-primary-color text-white hover:bg-primary-color/90" : ""}
        >
          New
        </Button>
      </div>

      {effectiveAddressMode === "saved" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {isLoadingAddresses ? (
            <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-500">
              Loading addresses...
            </div>
          ) : (
            addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                disabled={isCreatingOrder}
                onClick={() => setSelectedAddressId(address.id)}
                className={`rounded-lg border p-4 text-left text-sm transition ${
                  effectiveSelectedAddressId === address.id
                    ? "border-primary-color bg-primary-color/5"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-bold text-slate-950">{address.recipient_name}</div>
                <div className="mt-1 text-slate-500">{address.phone}</div>
                <div className="mt-2 leading-6 text-slate-700">
                  {address.address_line1}
                  {address.address_line2 ? `, ${address.address_line2}` : ""}
                  <br />
                  {address.commune}, {address.district}, {address.city}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-recipient">Recipient name</Label>
              <Input
                id="order-recipient"
                required
                disabled={isCreatingOrder}
                value={newAddress.recipient_name}
                onChange={(event) => setNewAddress((current) => ({ ...current, recipient_name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-phone">Phone</Label>
              <Input
                id="order-phone"
                required
                disabled={isCreatingOrder}
                value={newAddress.phone}
                onChange={(event) => setNewAddress((current) => ({ ...current, phone: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-address-1">Address line 1</Label>
            <Input
              id="order-address-1"
              required
              disabled={isCreatingOrder}
              value={newAddress.address_line1}
              onChange={(event) => setNewAddress((current) => ({ ...current, address_line1: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="order-address-2">Address line 2</Label>
            <Input
              id="order-address-2"
              disabled={isCreatingOrder}
              value={newAddress.address_line2 || ""}
              onChange={(event) => setNewAddress((current) => ({ ...current, address_line2: event.target.value }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="order-city">City</Label>
              <Input
                id="order-city"
                required
                disabled={isCreatingOrder}
                value={newAddress.city}
                onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-district">District</Label>
              <Input
                id="order-district"
                required
                disabled={isCreatingOrder}
                value={newAddress.district}
                onChange={(event) => setNewAddress((current) => ({ ...current, district: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-commune">Commune</Label>
              <Input
                id="order-commune"
                required
                disabled={isCreatingOrder}
                value={newAddress.commune}
                onChange={(event) => setNewAddress((current) => ({ ...current, commune: event.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={saveAddress}
              disabled={isCreatingOrder}
              onChange={(event) => setSaveAddress(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-primary-color"
            />
            Save this address to my profile
          </label>
        </div>
      )}
    </section>
  );
}
