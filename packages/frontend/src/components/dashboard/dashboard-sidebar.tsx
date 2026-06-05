"use client"

import { Activity, LogOut, LogIn, PanelLeft } from "lucide-react"
import { Project } from "@logstream/shared/src/project.types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSignOutMutation } from "@/redux/features/authApi"
import { useRouter } from "next/navigation"
import { Button } from "../ui/button"
import { useDashboard } from "@/context/dashboard-context"
import { NavigationMenu } from "./navigation-menu"

interface DashboardSidebarProps {
  projects?: Project[]
  currentProject?: Project | null
  setCurrentProject?: (p: Project) => void
  setIsAddProjectOpen?: (v: boolean) => void
  currentEnv?: "production" | "staging" | "development"
  setCurrentEnv?: (v: "production" | "staging" | "development") => void
  isStreaming?: boolean
  isSimulatedMode?: boolean
  isCheckingSession?: boolean
}

export function DashboardSidebar({}: DashboardSidebarProps) {
  const { state, toggleSidebar } = useSidebar()
  const isSidebarCollapsed = state === "collapsed"

  const {
    currentEnv,
    setCurrentEnv,
    isStreaming,
    user,
    isAuthenticated,
    isCheckingSession
  } = useDashboard()

  const [signOut] = useSignOutMutation()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut().unwrap()
      router.push("/")
    } catch (err) {
      console.error("Failed to sign out", err)
    }
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="border-r border-neutral-200/50 bg-neutral-50/50 dark:border-neutral-800/50 dark:bg-neutral-900/50"
    >
      <SidebarHeader className="border-b border-neutral-200/50 p-4 py-3.5 dark:border-neutral-800/50">
        <div className="flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="rounded bg-neutral-950 p-0.5 shrink-0 dark:bg-white">
              <Activity className="h-3.5 w-3.5 text-white dark:text-black" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-mono text-sm font-bold tracking-tight truncate">
                LogStreamOps
              </span>
            )}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Environment Selector */}
        <div className="p-3 border-b border-neutral-200/50 dark:border-neutral-800/50">
          {isSidebarCollapsed ? (
            <div className="flex flex-col gap-2 items-center">
              {["P", "S", "D"].map((envLetter, idx) => (
                <span
                  key={idx}
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-mono text-[9px] font-bold ${
                    idx === 0
                      ? "bg-rose-500/10 text-rose-500"
                      : idx === 1
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-emerald-500/10 text-emerald-500"
                  }`}
                >
                  {envLetter}
                </span>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                Environment Target
              </label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-100/50 dark:bg-neutral-950/20 p-0.5 rounded border border-neutral-200/50 dark:border-neutral-800/50 font-mono text-[9px]">
                {([`production`, `staging`, `development`] as const).map((env) => {
                  // Only production is accessible if the user isn't authenticated
                  const isLocked = !isAuthenticated && env !== "production"
                  return (
                    <button
                      key={env}
                      onClick={() => !isLocked && setCurrentEnv(env)}
                      disabled={isLocked}
                      className={`rounded py-0.5 capitalize transition-all ${
                        currentEnv === env && !isLocked
                          ? "bg-white text-neutral-900 shadow dark:bg-neutral-800 dark:text-neutral-100 font-semibold"
                          : isLocked
                            ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
                            : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      }`}
                    >
                      {env === "development" ? "dev" : env === "staging" ? "stage" : "prod"}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Navigation items */}
        <NavigationMenu isCollapsed={isSidebarCollapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
        {/* Connection status */}
        <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] text-neutral-500">
          <span
            className={`h-2 w-2 rounded-full ${isStreaming ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"}`}
          />
          {!isSidebarCollapsed && (
            <span className="font-mono">
              {isStreaming ? "WS Streaming Connected" : "Stream Paused"}
            </span>
          )}
        </div>

        {/* User Profile and Actions */}
        <div className="flex items-center justify-between pt-2">
          {isCheckingSession ? (
            <div className="flex w-full items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2 shadow-sm animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                {!isSidebarCollapsed && (
                  <div className="flex flex-col gap-1">
                    <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
                    <div className="h-2 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  </div>
                )}
              </div>
            </div>
          ) : isSidebarCollapsed ? (
            <div className="flex flex-col gap-3 items-center w-full">
              {!isAuthenticated ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 font-bold text-xs uppercase dark:bg-neutral-800">
                  ?
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs uppercase dark:bg-indigo-900/50 dark:text-indigo-400">
                  {user?.firstname?.[0] || user?.email?.[0] || "U"}
                </div>
              )}
              <Button
                onClick={toggleSidebar}
                variant="ghost"
                className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                title="Collapse Sidebar"
              >
                <PanelLeft className="h-3.5 w-3.5" />
              </Button>
              {!isAuthenticated ? (
                <Button
                  onClick={() => router.push("/auth/login")}
                  variant="outline"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="Sign In"
                >
                  <LogIn className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex w-full items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 rounded-lg p-2 shadow-sm">
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-xs uppercase ${
                    !isAuthenticated
                      ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                      : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400"
                  }`}
                >
                  {!isAuthenticated ? "?" : user?.firstname?.[0] || user?.email?.[0] || "U"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {!isAuthenticated
                      ? "Guest"
                      : `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User"}
                  </span>
                  <span className="truncate text-[9px] text-neutral-500">
                    {!isAuthenticated ? "Demo Workspace" : user?.email || "..."}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!isAuthenticated ? (
                  <>
                    <Button
                      onClick={toggleSidebar}
                      variant="ghost"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                      title="Collapse Sidebar"
                    >
                      <PanelLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={() => router.push("/auth/login")}
                      variant="outline"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="Sign In"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={toggleSidebar}
                      variant="ghost"
                      className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                      title="Collapse Sidebar"
                    >
                      <PanelLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
