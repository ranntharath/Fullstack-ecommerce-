import { Suspense } from "react";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { ProfilePageContent } from "@/features/client/profile/components/ProfilePageContent";
import { ProfileLoadingState } from "@/features/client/profile/components/ProfileLoadingState";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingState />}>
      <AuthGuard>
        <ProfilePageContent />
      </AuthGuard>
    </Suspense>
  );
}
