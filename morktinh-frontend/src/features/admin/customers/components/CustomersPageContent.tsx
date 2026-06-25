"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TopHeader } from "@/components/layouts/admin/top-header";
import { Button } from "@/components/ui/button";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { CustomersTable } from "./CustomersTable";

export function CustomersPageContent() {
  const [createOpen, setCreateOpen] = useState(false);

  return <div className="flex min-h-screen flex-col bg-slate-50/70">
    <TopHeader title="Customer Management" />
    <main className="mx-auto flex w-full max-w-375 flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1><p className="mt-1 text-sm text-slate-500">Manage customer details, login access, and email verification.</p></div>
        <Button className="bg-primary-color text-white hover:bg-primary-color/90" onClick={() => setCreateOpen(true)}><Plus /> Add customer</Button>
      </div>
      <CustomersTable />
    </main>
    <CustomerFormDialog open={createOpen} onOpenChange={setCreateOpen} />
  </div>;
}
