import { Suspense } from "react";
import { ClientHomeContent } from "@/features/client/home/components/ClientHomeContent";

export default function ClientHomePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-100 text-slate-500">Loading catalog...</div>}>
      <ClientHomeContent />
    </Suspense>
  );
}
