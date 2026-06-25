"use client";

import { Mail, Phone, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/features/client/profile/types";
import { getImageUrl } from "@/lib/image-utils";

interface AccountSummaryCardProps {
  profile: UserProfile | undefined;
  fullName: string;
}

export function AccountSummaryCard({ profile, fullName }: AccountSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-primary-color" />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary-color/10 text-xl font-bold text-primary-color">
            {profile?.profile_picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getImageUrl(profile.profile_picture)} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              fullName[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-slate-950">{fullName}</div>
            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <Mail className="h-4 w-4" />
              <span className="truncate">{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <Phone className="h-4 w-4" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
