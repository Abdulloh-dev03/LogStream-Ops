"use client"

import React from "react"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 overflow-y-auto telemetry-scrollbar p-4 md:p-6 space-y-6 transition-all duration-300 bg-background text-foreground">
      {children}
    </div>
  )
}
