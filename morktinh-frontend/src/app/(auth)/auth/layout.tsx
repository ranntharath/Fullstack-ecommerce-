import React from 'react';
import ClientReduxProvider from '@/store/client/ClientReduxProvider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientReduxProvider>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </ClientReduxProvider>
  );
}
