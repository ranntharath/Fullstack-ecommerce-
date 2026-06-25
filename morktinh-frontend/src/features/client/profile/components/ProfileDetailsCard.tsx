"use client";

import { FormEvent, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UpdateUserProfileRequest, UserProfile } from "@/features/client/profile/types";
import { getImageUrl } from "@/lib/image-utils";

interface ProfileDetailsCardProps {
  profile: UserProfile;
  isSaving: boolean;
  onSave: (data: UpdateUserProfileRequest) => Promise<void>;
}

export function ProfileDetailsCard({ profile, isSaving, onSave }: ProfileDetailsCardProps) {
  const [profileForm, setProfileForm] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone: profile.phone || "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(getImageUrl(profile.profile_picture));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave({
      ...profileForm,
      profile_picture: profilePicture,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="space-y-2">
              <Label htmlFor="first-name">First name</Label>
              <Input
                id="first-name"
                value={profileForm.first_name}
                onChange={(event) => setProfileForm((current) => ({ ...current, first_name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last name</Label>
              <Input
                id="last-name"
                value={profileForm.last_name}
                onChange={(event) => setProfileForm((current) => ({ ...current, last_name: event.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={profileForm.phone}
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-picture">Profile picture</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-bold text-slate-400">
                {profilePicturePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePicturePreview} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <UserRound className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProfilePicture(file);
                    if (file) {
                      setProfilePicturePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="w-full bg-primary-color text-white hover:bg-primary-color/90">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
