/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Folder,
  ShoppingBag,
  Users,
  ListTree,
  Star,
  Tag,
  ClipboardList,
  LogOut,
  Percent,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "@/features/auth/authSlice"
import { baseApi } from "@/store/baseApi"
import type { AppDispatch, RootState } from "@/store/admin/store"
import { ConfirmLogoutDialog } from "@/components/common/ConfirmLogoutDialog"

const navigationGroups = [
  {
    title: "MAIN MENU",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Product Media", url: "/admin/media", icon: Folder },
      { title: "Order Management", url: "/admin/orders", icon: ShoppingBag },
      { title: "Customer", url: "/admin/customers", icon: Users },
      { title: "Categories", url: "/admin/categories", icon: ListTree },
      { title: "Brand", url: "/admin/brands", icon: Star },
      { title: "Discounts", url: "/admin/discounts", icon: Percent },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "PRODUCT",
    items: [
      { title: "Add Products", url: "/admin/products/add", icon: Tag },
      { title: "Product List", url: "/admin/products", icon: ClipboardList },
      { title: "Product Tags", url: "/admin/product-tags", icon: Tag },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const displayName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || user?.email || "Admin User"
  const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase() || "AD"

  const handleLogout = () => {
    setLogoutOpen(false)
    dispatch(logout())
    dispatch(baseApi.util.resetApiState())
    router.replace("/auth/login")
  }

  return (
    <Sidebar className="border-r bg-white text-slate-700 px-1.5 overflow-x-hidden">
      <SidebarHeader className="pt-6 pb-4">
        <div className="flex items-center gap-2 px-4">
          <img className="w-16 h-16 object-cover rounded-full" src="https://i.pinimg.com/736x/3b/9d/50/3b9d50a32ed833d9cdc73978e98c8fc2.jpg" alt="" />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white overflow-x-hidden">
        {navigationGroups.map((group, index) => (
          <Fragment key={group.title}>
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-slate-400 px-4 mb-2">
                {group.title}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`h-11 px-4 mx-2 rounded-lg transition-colors ${isActive
                            ? "bg-primary-color text-white hover:bg-primary-color/90 hover:text-white"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                        >
                          <Link href={item.url}>
                            <item.icon className="size-5 mr-2" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {index < navigationGroups.length - 1 && (
              <SidebarSeparator className="mx-6 my-2 bg-slate-100" />
            )}
          </Fragment>
        ))}

        <SidebarSeparator className="mx-6 my-2 bg-slate-100" />

        
      </SidebarContent>

      <SidebarFooter className="bg-white p-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-900 text-white font-semibold">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="max-w-28 truncate text-sm font-semibold text-slate-900">{displayName}</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
          </div>
          <button type="button" onClick={() => setLogoutOpen(true)} aria-label="Log out" title="Log out" className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
      <ConfirmLogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={handleLogout} />
    </Sidebar>
  )
}
