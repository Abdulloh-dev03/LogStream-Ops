"use client"

import { useRouter } from "next/navigation"
import { TelemetryChart } from "@/components/telemetry-chart"
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { useDashboard } from "@/context/dashboard-context"
import { ArrowRight, FolderKanban, Plus, Clock, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

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

// Helper to get log level badge styles
const getLogLevelStyle = (level: string) => {
  switch (level) {
    case "CRITICAL":
      return "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400"
    case "ERROR":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400"
    case "WARNING":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
    default:
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
  }
}

export default function DashboardPage() {
  const {
    kpiData,
    logs,
    projects,
    projectLogsPreview,
    selectedSeverity,
    setSelectedSeverity,
    setIsAddProjectOpen,
    newLogIds
  } = useDashboard()

  const router = useRouter()


  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500 animate-pulse" />
            SRE Cockpit Dashboard
          </h1>
          <p className="text-md text-neutral-400 mt-1">
            Aggregated system health metrics and live ingestion streams across all registered nodes.
          </p>
        </div>

        <Button
          onClick={() => setIsAddProjectOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-4 font-mono text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project</span>
        </Button>
      </div>

      {/* KPI Overviews (Aggregated across all projects) */}
      <DashboardKpiCards kpiData={kpiData} />
      
      {/* Top Section: Aggregated Analytics Chart */}
      <TelemetryChart
        logs={logs}
        onSelectSeverity={setSelectedSeverity}
        selectedSeverity={selectedSeverity}
      />

      {/* Grid Header */}
      <div className="border-b border-neutral-200/50 pb-3 dark:border-neutral-800/50 mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
          <FolderKanban className="h-4.5 w-4.5 text-indigo-500" />
          Workspace Project Nodes ({projects.length})
        </h2>
      </div>

      {/* Bottom Section: Dynamic Grid of Project Cards */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-850 p-12 text-center text-xs text-neutral-400 bg-white/40 dark:bg-neutral-950/20">
          No projects registered. Create a new project to start tracking logs.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const env = getEnvDetails(proj.name)
            const previewLogs = projectLogsPreview[proj.id] || []

            return (
              <div
                key={proj.id}
                onClick={() => router.push(`/projects/${proj.id}/logs`)}
                className="group rounded-xl border border-neutral-250/60 bg-white dark:border-neutral-800/60 dark:bg-neutral-900/40 p-5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-90 cursor-pointer"
              >
                {/* Header */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white truncate flex-1 group-hover:text-indigo-500 transition-colors">
                      {proj.name}
                    </h3>
                    <span className={`rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold uppercase shrink-0 ${env.className}`}>
                      {env.tag}
                    </span>
                  </div>
                </div>

                {/* Real-time Logs Preview Container */}
                <div className="flex-1 my-4 overflow-hidden flex flex-col justify-start">
                  <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-wider block mb-2 font-mono items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    Live Log Ingest (Max 6)
                  </span>

                  <div className="space-y-1.5 flex-1 overflow-hidden">
                    {previewLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center border border-dashed border-neutral-100 dark:border-neutral-800/40 rounded-lg p-4 bg-neutral-50/40 dark:bg-neutral-950/10">
                        <span className="text-[10px] text-neutral-400 font-mono italic">No telemetry data ingested yet</span>
                      </div>
                    ) : (
                      previewLogs.map((log) => {
                        const isNew = newLogIds.has(log.id)
                        const levelClass = getLogLevelStyle(log.level)

                        return (
                          <div
                            key={log.id}
                            className={`flex items-center gap-2 rounded px-2 py-1.5 transition-all text-[10px] font-mono border border-transparent bg-neutral-50/70 hover:bg-neutral-100/50 dark:bg-neutral-950/20 dark:hover:bg-neutral-950/40 ${
                              isNew ? "animate-flash-new border-indigo-400/30" : ""
                            }`}
                          >
                            <span className={`inline-flex items-center rounded px-1 py-0.2 text-[8px] font-bold shrink-0 ${levelClass}`}>
                              {log.level}
                            </span>
                            <span className="truncate flex-1 text-neutral-700 dark:text-neutral-300 font-medium">
                              {log.message}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Card Footer Navigation Button */}
                <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-neutral-400">
                    ID: {proj.id.substring(0, 8)}...
                  </span>
                  
                  <div className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform duration-300">
                    <span>Inspect Logs</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

