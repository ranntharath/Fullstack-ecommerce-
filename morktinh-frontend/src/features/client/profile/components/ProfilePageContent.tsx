"use client";

import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "@/features/auth/authSlice";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useGetProfileQuery,
  useUpdateAddressMutation,
  useUpdateProfileMutation,
} from "@/features/client/profile/api/profileApi";
import {
  CustomerAddressRequest,
  UpdateUserProfileRequest,
} from "@/features/client/profile/types";
import { AccountSummaryCard } from "@/features/client/profile/components/AccountSummaryCard";
import { AddressManager } from "@/features/client/profile/components/AddressManager";
import { ProfileDetailsCard } from "@/features/client/profile/components/ProfileDetailsCard";
import { ProfileLoadingState } from "@/features/client/profile/components/ProfileLoadingState";

export function ProfilePageContent() {
  const dispatch = useDispatch();
  const { data: profile, isLoading: profileLoading } = useGetProfileQuery();
  const { data: addresses = [], isLoading: addressesLoading } = useGetAddressesQuery();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [createAddress, { isLoading: creatingAddress }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: updatingAddress }] = useUpdateAddressMutation();
  const [deleteAddress, { isLoading: deletingAddress }] = useDeleteAddressMutation();
  const [message, setMessage] = useState("");

  const fullName = useMemo(() => {
    const name = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    return name || "Your profile";
  }, [profile]);

  const handleProfileSave = async (data: UpdateUserProfileRequest) => {
    setMessage("");

    const formData = new FormData();
    formData.append("first_name", data.first_name || "");
    formData.append("last_name", data.last_name || "");
    formData.append("phone", data.phone || "");
    if (data.profile_picture) {
      formData.append("profile_picture", data.profile_picture);
    }

    const updated = await updateProfile(formData).unwrap();
    dispatch(updateUser({
      first_name: updated.first_name,
      last_name: updated.last_name,
      phone: updated.phone,
      profile_picture: updated.profile_picture,
    }));
    setMessage("Profile updated.");
  };

  const handleCreateAddress = async (data: CustomerAddressRequest) => {
    setMessage("");
    await createAddress(data).unwrap();
    setMessage("Address added.");
  };

  const handleUpdateAddress = async (id: number, data: CustomerAddressRequest) => {
    setMessage("");
    await updateAddress({ id, data }).unwrap();
    setMessage("Address updated.");
  };

  const handleDeleteAddress = async (id: number) => {
    setMessage("");
    await deleteAddress(id).unwrap();
    setMessage("Address deleted.");
  };

  if (profileLoading) {
    return <ProfileLoadingState />;
  }

  return (
    <main className="flex-1 bg-slate-50/50 pb-16">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
              Profile
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your personal details and delivery addresses.
            </p>
          </div>
          {message && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="space-y-6">
            <AccountSummaryCard profile={profile} fullName={fullName} />
            {profile && (
              <ProfileDetailsCard
                key={profile.id}
                profile={profile}
                isSaving={savingProfile}
                onSave={handleProfileSave}
              />
            )}
          </section>

          <section className="space-y-6">
            <AddressManager
              addresses={addresses}
              isLoading={addressesLoading}
              isCreating={creatingAddress}
              isUpdating={updatingAddress}
              isDeleting={deletingAddress}
              onCreate={handleCreateAddress}
              onUpdate={handleUpdateAddress}
              onDelete={handleDeleteAddress}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
