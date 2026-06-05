
import {  Search, Play, Pause } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
  setIsCommandPaletteOpen: (val: boolean) => void
  isStreaming: boolean
  setIsStreaming: (val: boolean) => void
}

export function DashboardHeader({
  setIsCommandPaletteOpen,
  isStreaming,
  setIsStreaming,
}: DashboardHeaderProps) {
  const { state } = useSidebar()
  const isSidebarCollapsed = state === "collapsed"

  return (
    <header className="h-14 shrink-0 border-b border-neutral-200/50 px-4 flex items-center justify-between gap-4 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-950/10">
      {/* Collapse sidebar toggler (when collapsed) */}
      <div className="flex items-center gap-3">
        {isSidebarCollapsed && (
          <SidebarTrigger className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer" />
        )}

        {/* Globally bound Command Menu Search button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex h-9 w-65 items-center justify-between rounded-lg border border-neutral-200/85 px-3 text-left text-xs text-neutral-400 hover:border-neutral-300 dark:border-neutral-850 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/50"
        >
          <span className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search telemetry commands...</span>
          </span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 font-mono text-[9px] text-neutral-400 border dark:bg-neutral-950 dark:border-neutral-800 sm:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Stream and Simulation Control actions */}
      <div className="flex items-center gap-3">
        {/* Stream pause toggler */}
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs font-semibold shadow-sm transition-all ${
            isStreaming
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          }`}
        >
          {isStreaming ? (
            <>
              <Pause className="h-3 w-3 animate-pulse" />
              <span>Streaming</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              <span>Stream Paused</span>
            </>
          )}
        </button>
        <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800" />
        
        {/* Dark mode switcher */}
        <ThemeToggle />
      </div>
    </header>
  )
}
