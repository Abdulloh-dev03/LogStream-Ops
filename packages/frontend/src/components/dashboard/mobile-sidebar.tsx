"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Activity } from "lucide-react"
import { NavigationMenu } from "./navigation-menu"

interface MobileSidebarProps {
  isOpen: boolean
  onClose: (open: boolean) => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[18rem] bg-neutral-50 dark:bg-neutral-900 p-0 text-foreground border-r border-neutral-200/50 dark:border-neutral-800/50">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Mobile navigation drawer</SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <div className="border-b border-neutral-200/50 p-4 py-3.5 dark:border-neutral-800/50 flex items-center gap-2.5">
            <div className="rounded bg-neutral-950 p-0.5 shrink-0 dark:bg-white">
              <Activity className="h-3.5 w-3.5 text-white dark:text-black" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight">
              LogStreamOps
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <NavigationMenu isCollapsed={false} onItemClick={() => onClose(false)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
