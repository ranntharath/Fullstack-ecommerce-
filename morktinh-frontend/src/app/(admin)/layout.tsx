import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layouts/admin/app-sidebar"
import AdminReduxProvider from "@/store/admin/AdminReduxProvider"
import { AuthGuard } from "@/features/auth/components/AuthGuard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminReduxProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen min-w-0 overflow-x-hidden">
          <AuthGuard allowedRoles={['admin']}>
            {children}
          </AuthGuard>
        </SidebarInset>
      </SidebarProvider>
    </AdminReduxProvider>
  )
}
