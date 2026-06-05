import React from "react"
import { Terminal, ShieldAlert, Cpu, CheckCircle2, CheckCircle } from "lucide-react"

interface DashboardKpiCardsProps {
  kpiData: {
    total: number
    errorRatio: string
    criticalCount: number
    confidenceScore: number
  }
}

export function DashboardKpiCards({ kpiData }: DashboardKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Ingest log count */}
      <div className="rounded-xl border border-neutral-200/50 bg-white p-4 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/50 flex flex-col justify-between h-25">
        <div className="flex justify-between items-start text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Ingested Telemetry</span>
          <Terminal className="h-3.5 w-3.5 text-neutral-400" />
        </div>
        <div className="flex justify-between items-end mt-2">
          <span className="font-mono text-xl font-bold dark:text-neutral-100">
            {kpiData.total} <span className="text-[10px] font-normal text-neutral-400">events</span>
          </span>
          
          {/* Micro SVG sparkline */}
          <svg className="w-16 h-6 overflow-visible text-indigo-500" viewBox="0 0 50 15">
            <path
              d="M0,12 Q10,2 20,8 T40,5 T50,2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* KPI 2: System Error Rate */}
      <div className="rounded-xl border border-neutral-200/50 bg-white p-4 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/50 flex flex-col justify-between h-25">
        <div className="flex justify-between items-start text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          <span>System Error Ratio</span>
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
        </div>
        <div className="flex justify-between items-end mt-2">
          <span className={`font-mono text-xl font-bold ${Number(kpiData.errorRatio) > 0 ? "text-rose-500" : "dark:text-neutral-100"}`}>
            {kpiData.errorRatio}%
          </span>

          {/* Micro SVG sparkline */}
          <svg className="w-16 h-6 overflow-visible text-rose-500" viewBox="0 0 50 15">
            <path
              d="M0,15 L10,12 L20,8 L30,12 L40,4 L50,0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* KPI 3: Critical alerts */}
      <div className="rounded-xl border border-neutral-200/50 bg-white p-4 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/50 flex flex-col justify-between h-25">
        <div className="flex justify-between items-start text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Critical Alerts</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
        </div>
        <div className="flex justify-between items-end mt-2">
          <span className={`font-mono text-xl font-bold ${kpiData.criticalCount > 0 ? "text-violet-500" : "dark:text-neutral-100"}`}>
            {kpiData.criticalCount} <span className="text-[10px] font-normal text-neutral-400">active</span>
          </span>

          {/* Micro SVG sparkline */}
          <svg className="w-16 h-6 overflow-visible text-violet-500" viewBox="0 0 50 15">
            <path
              d="M0,5 Q10,12 25,5 T50,10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* KPI 4: AI Diagnostic Rates */}
      <div className="rounded-xl border border-neutral-200/50 bg-white p-4 shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/50 flex flex-col justify-between h-25">
        <div className="flex justify-between items-start text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
          <span>Diagnostic Engine</span>
          <Cpu className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div className="flex justify-between items-end mt-2">
          <span className="font-mono text-xl font-bold text-indigo-600 dark:text-purple-500">
            {kpiData.confidenceScore}% <span className="text-[10px] font-normal text-neutral-400">F1</span>
          </span>

          <div className="rounded  p-0.5 text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}
