"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDashboard } from "@/context/dashboard-context"
import { useGetProjectLogsQuery } from "@/redux/features/logQueryApi"
import { TelemetryTable } from "@/components/dashboard/telemetry-table"
import { ArrowLeft, Activity, FolderKanban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Helper to determine project environment tag and styling
const getEnvDetails = (projectName: string) => {
  const name = projectName.toLowerCase()
  if (name.includes("production") || name.includes("prod") || name.includes("gateway")) {
    return { tag: "production", className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" }
  } else if (name.includes("billing") || name.includes("stripe") || name.includes("stage") || name.includes("provider")) {
    return { tag: "staging", className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" }
  } else {
    return { tag: "development", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" }
  }
}

export default function ProjectLogsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const {
    projects,
    logs: globalLogs,
    newLogIds,
    setAiAnalysisLogState,
    setIsAiPanelOpenState,
    handleResolveLog,
    isAuthenticated
  } = useDashboard()

  const project = useMemo(() => {
    return projects.find(p => p.id === projectId)
  }, [projects, projectId])

  // Get project logs from RTK Query (real mode)
  const { data: realLogsData, isLoading } = useGetProjectLogsQuery(
    { projectId },
    { skip: !isAuthenticated }
  )

  // Use real logs if authenticated, fallback to filtered mock logs
  const projectLogs = useMemo(() => {
    if (isAuthenticated) {
      return realLogsData?.logs || []
    }
    return globalLogs.filter(l => l.projectId === projectId)
  }, [isAuthenticated, realLogsData, globalLogs, projectId])

  // Local filter states for the dedicated project logs page
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [showResolvedMode, setShowResolvedMode] = useState<"all" | "unresolved" | "resolved">("unresolved")
  const [densityMode, setDensityMode] = useState<"comfortable" | "compact">("comfortable")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  // Filter logs locally
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(projectLogs)) return []
    return projectLogs.filter(log => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesMessage = log.message?.toLowerCase().includes(query) ?? false
        const matchesUrl = log.url ? log.url.toLowerCase().includes(query) : false
        if (!matchesMessage && !matchesUrl) return false
      }
      if (selectedSeverity && log.level !== selectedSeverity) return false
      if (showResolvedMode === "unresolved" && log.resolved) return false
      if (showResolvedMode === "resolved" && !log.resolved) return false
      return true
    })
  }, [projectLogs, searchQuery, selectedSeverity, showResolvedMode])

  const env = useMemo(() => {
    return project ? getEnvDetails(project.name) : { tag: "unknown", className: "bg-neutral-100 text-neutral-400" }
  }, [project])

  if (!project && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-sm font-semibold text-neutral-500">Project not found or you don't have access.</p>
        <Button onClick={() => router.push("/dashboard")} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cockpit
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header and navigation back to Cockpit */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Cockpit</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-indigo-500" />
                {project?.name || "Loading Project..."}
              </h1>
              <span className={`rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold uppercase ${env.className}`}>
                {env.tag}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Project ID: {projectId}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <div>
              <span className="block font-semibold uppercase text-neutral-500 text-[8px]">TOTAL LOGS</span>
              <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                {projectLogs.length}
              </span>
            </div>
            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
            <div>
              <span className="block font-semibold uppercase text-neutral-500 text-[8px]">UNRESOLVED</span>
              <span className="font-bold text-rose-500 text-sm">
                {projectLogs.filter(l => !l.resolved).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main full-width logs table */}
      {isLoading ? (
        <div className="h-80 flex items-center justify-center bg-white dark:bg-neutral-900 border rounded-xl">
          <Activity className="h-6 w-6 animate-pulse text-indigo-500" />
        </div>
      ) : (
        <TelemetryTable
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSeverity={selectedSeverity}
          setSelectedSeverity={setSelectedSeverity}
          showResolvedMode={showResolvedMode}
          setShowResolvedMode={setShowResolvedMode}
          densityMode={densityMode}
          setDensityMode={setDensityMode}
          filteredLogs={filteredLogs}
          expandedLogId={expandedLogId}
          setExpandedLogId={setExpandedLogId}
          newLogIds={newLogIds}
          setAiAnalysisLog={(log) => {
            if (!isAuthenticated) {
              return toast.error("Authentication required", {
                description: "Please sign in to run AI root cause diagnostics.",
              })
            }
            setAiAnalysisLogState(log)
          }}
          setIsAiPanelOpen={(val) => {
            if (!isAuthenticated && val) {
              return toast.error("Authentication required", {
                description: "Please sign in to access the LogStream AI engine.",
              })
            }
            setIsAiPanelOpenState(val)
          }}
          handleResolveLog={handleResolveLog}
        />
      )}
    </div>
  )
}
