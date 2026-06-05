"use client"

import React, { useMemo, useState } from "react"
import { Log } from "@logstream/shared"

interface TelemetryChartProps {
  logs: Log[]
  onSelectSeverity?: (severity: string | null) => void
  selectedSeverity?: string | null
}

export function TelemetryChart({ logs, onSelectSeverity, selectedSeverity }: TelemetryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Compute timeslices (last 12 interval divisions)
  const chartData = useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) return []

    // Distribute logs into 12 buckets based on timestamp
    const now = new Date()
    const bucketsCount = 12
    const bucketDurationMs = 2 * 60 * 60 * 1000 // 2 hours each

    const buckets = Array.from({ length: bucketsCount }, (_, i) => {
      const start = new Date(now.getTime() - (bucketsCount - i) * bucketDurationMs)
      const end = new Date(start.getTime() + bucketDurationMs)
      return {
        label: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        start,
        end,
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
        total: 0,
      }
    })

    logs.forEach(log => {
      const time = new Date(log.createdAt)
      const bucket = buckets.find(b => time >= b.start && time < b.end)
      if (bucket) {
        bucket.total++
        if (log.level === "INFO") bucket.info++
        else if (log.level === "WARNING") bucket.warning++
        else if (log.level === "ERROR") bucket.error++
        else if (log.level === "CRITICAL") bucket.critical++
      }
    })

    return buckets
  }, [logs])

  // Get max values for sizing
  const maxTotal = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.total), 1)
    // Round to next multiple of 5 for nice gridlines
    return Math.ceil(max / 5) * 5
  }, [chartData])

  // SVG parameters
  const width = 600
  const height = 150
  const paddingX = 40
  const paddingY = 20

  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  // Generate coordinates for the SVG path
  const points = useMemo(() => {
    if (chartData.length === 0) return []
    return chartData.map((d, i) => {
      const x = paddingX + (i / (chartData.length - 1)) * chartWidth
      // Invert Y axis: 0 is top of SVG
      const y = paddingY + chartHeight - (d.total / maxTotal) * chartHeight
      return { x, y }
    })
  }, [chartData, maxTotal, chartWidth, chartHeight])

  const pathD = useMemo(() => {
    if (points.length === 0) return ""
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
    }, "")
  }, [points])

  const areaD = useMemo(() => {
    if (points.length === 0) return ""
    const first = points[0]
    const last = points[points.length - 1]
    return `${pathD} L ${last.x} ${paddingY + chartHeight} L ${first.x} ${paddingY + chartHeight} Z`
  }, [points, pathD, chartHeight])

  return (
    <div className="relative rounded-xl border border-neutral-200/50 bg-white p-4 shadow-sm transition-all dark:border-neutral-800/50 dark:bg-neutral-900/50">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Ingestion Telemetry Stream
          </h3>
          <p className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100">
            {logs.length} <span className="text-xs font-normal text-neutral-500">logged events (24h)</span>
          </p>
        </div>

        {/* Severity Legend / Quick Filters */}
        <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
          {(["INFO", "WARNING", "ERROR", "CRITICAL"] as const).map(sev => {
            const isSelected = selectedSeverity === sev
            const colorClass = 
              sev === "INFO" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
              sev === "WARNING" ? "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" :
              sev === "ERROR" ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" :
              "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400"

            return (
              <button
                key={sev}
                onClick={() => onSelectSeverity?.(isSelected ? null : sev)}
                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 transition-all ${colorClass} ${
                  isSelected ? "ring-2 ring-neutral-400 dark:ring-neutral-600 ring-offset-1 dark:ring-offset-neutral-900 font-bold" : "opacity-75 hover:opacity-100"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  sev === "INFO" ? "bg-emerald-500" :
                  sev === "WARNING" ? "bg-amber-500" :
                  sev === "ERROR" ? "bg-rose-500" : "bg-violet-500"
                }`} />
                {sev}
              </button>
            )
          })}
          {selectedSeverity && (
            <button
              onClick={() => onSelectSeverity?.(null)}
              className="rounded-full border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-neutral-600 hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-37.5">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.6 0.15 250 / 15%)" className="dark:stop-color-neutral-300 dark:stop-opacity-10" />
              <stop offset="100%" stopColor="oklch(0.6 0.15 250 / 0%)" />
            </linearGradient>
            <linearGradient id="chartPathGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((r, idx) => {
            const y = paddingY + chartHeight * r
            const label = Math.round(maxTotal * (1 - r))
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-neutral-200 dark:text-neutral-800"
                  strokeDasharray="2 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="font-mono text-[9px] fill-neutral-400 dark:fill-neutral-500"
                >
                  {label}
                </text>
              </g>
            )
          })}

          {/* Area under curve */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#chartAreaGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Spline Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#chartPathGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />
          )}

          {/* Hover interactive bars and overlay points */}
          {points.map((p, idx) => {
            const d = chartData[idx]
            const isHovered = hoveredIndex === idx
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Invisible broad column for hover target */}
                <rect
                  x={p.x - chartWidth / (chartData.length * 2)}
                  y={paddingY}
                  width={chartWidth / chartData.length}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Hover line guide */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={paddingY + chartHeight}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-neutral-200 dark:text-neutral-800"
                  />
                )}

                {/* Data Dot indicator */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 4 : 2}
                  className={`${
                    isHovered 
                      ? "fill-indigo-600 dark:fill-cyan-400 ring-4 ring-indigo-500/20" 
                      : "fill-neutral-400 dark:fill-neutral-600"
                  } transition-all duration-100`}
                />
              </g>
            )
          })}

          {/* X Axis Time Labels */}
          {chartData.map((d, idx) => {
            if (idx % 2 !== 0) return null // Only show every other label to fit nicely
            const x = paddingX + (idx / (chartData.length - 1)) * chartWidth
            return (
              <text
                key={idx}
                x={x}
                y={height - 2}
                textAnchor="middle"
                className="font-mono text-[9px] fill-neutral-400 dark:fill-neutral-500"
              >
                {d.label}
              </text>
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute z-10 rounded border border-neutral-200 bg-white p-2 text-[10px] shadow-lg dark:border-neutral-800 dark:bg-neutral-900 pointer-events-none"
            style={{
              left: `${Math.min(
                Math.max(
                  10,
                  (hoveredIndex / (chartData.length - 1)) * 90
                ),
                80
              )}%`,
              top: "10%",
            }}
          >
            <p className="font-semibold text-neutral-500 dark:text-neutral-400">
              Interval: {chartData[hoveredIndex].label}
            </p>
            <p className="font-bold font-mono text-neutral-800 dark:text-neutral-200">
              Total: {chartData[hoveredIndex].total} events
            </p>
            <div className="mt-1 flex gap-2 font-mono text-[9px]">
              <span className="text-emerald-500">I: {chartData[hoveredIndex].info}</span>
              <span className="text-amber-500">W: {chartData[hoveredIndex].warning}</span>
              <span className="text-rose-500">E: {chartData[hoveredIndex].error}</span>
              <span className="text-violet-500">C: {chartData[hoveredIndex].critical}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
