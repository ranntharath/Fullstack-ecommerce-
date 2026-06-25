"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

// We import from client store, but the slice state shape is the same across both stores
import { RootState } from "@/store/client/store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export function AuthGuard({ 
  children, 
  requireAuth = true,
  allowedRoles 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, user } = useSelector((state: RootState) => state.auth);

  const isAllowedRole = useMemo(() => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    return !!user && allowedRoles.includes(user.role);
  }, [allowedRoles, user]);

  const isAuthorized = !requireAuth || (isHydrated && isAuthenticated && isAllowedRole);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (requireAuth && !isAuthenticated) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (requireAuth && isAuthenticated && !isAllowedRole) {
      router.replace(user?.role === 'admin' ? '/admin' : '/');
    }
  }, [isAllowedRole, isAuthenticated, isHydrated, pathname, requireAuth, router, user?.role]);

  if ((!isHydrated || !isAuthorized) && requireAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-color mb-4"></div>
        <p className="text-slate-500 text-sm">Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
