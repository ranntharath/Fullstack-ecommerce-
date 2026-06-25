import { SidebarTrigger } from "@/components/ui/sidebar"
import { AdminHeaderActions } from "./AdminHeaderActions"

interface TopHeaderProps {
  title?: string
  children?: React.ReactNode
}

export function TopHeader({ title, children }: TopHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[72px] lg:px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-between gap-4">
        <div>
          {title && (
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-3">
          {children}
          <AdminHeaderActions />
        </div>
      </div>
    </header>
  )
}
