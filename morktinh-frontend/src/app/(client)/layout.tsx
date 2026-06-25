import React, { Suspense } from "react";
import ClientReduxProvider from "@/store/client/ClientReduxProvider";
import { Navbar } from "@/components/layouts/client/navbar";
import { Footer } from "@/components/layouts/client/footer";
import { StoreStatusBar } from "@/features/client/settings/components/StoreStatusBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientReduxProvider>
      <StoreStatusBar />
      <Suspense fallback={
        <div className="h-16 border-b border-slate-100 bg-white flex items-center px-4">
          <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
            <span className="text-2xl font-extrabold text-slate-300">Morktinh</span>
            <div className="h-8 w-48 bg-slate-100 rounded-md animate-pulse" />
          </div>
        </div>
      }>
        <Navbar />
      </Suspense>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </ClientReduxProvider>
  );
}
