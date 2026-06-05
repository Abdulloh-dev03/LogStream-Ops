"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Terminal, FolderKanban, KeyIcon, Settings } from "lucide-react"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

interface NavigationMenuProps {
  isCollapsed?: boolean
  onItemClick?: () => void
}

export function NavigationMenu({ isCollapsed = false, onItemClick }: NavigationMenuProps) {
  const pathname = usePathname()

  const menuItems = [
    { label: "Stream Explorer", icon: Terminal, href: "/dashboard" },
    { label: "Projects", icon: FolderKanban, href: "/projects" },
    { label: "API & Keys", icon: KeyIcon, href: "/api-keys" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <SidebarMenu className="p-2 space-y-0.5">
      {menuItems.map((item, idx) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <SidebarMenuItem key={idx}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition-all cursor-pointer ${
                isActive
                  ? "bg-neutral-250/60 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50 font-semibold hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-transparent"
              }`}
            >
              <Link href={item.href} onClick={onItemClick} className="flex items-center gap-3 w-full">
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
