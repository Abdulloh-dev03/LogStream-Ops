import React from "react"
import { Search, Sparkles, Check, Info } from "lucide-react"
import { Log } from "@logstream/shared/src/log.types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface TelemetryTableProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  selectedSeverity: string | null
  setSelectedSeverity: (val: string | null) => void
  showResolvedMode: "all" | "unresolved" | "resolved"
  setShowResolvedMode: (val: "all" | "unresolved" | "resolved") => void
  densityMode: "comfortable" | "compact"
  setDensityMode: (val: "comfortable" | "compact") => void
  filteredLogs: Log[]
  expandedLogId: string | null
  setExpandedLogId: (val: string | null) => void
  newLogIds: Set<string>
  setAiAnalysisLog: (log: Log | null) => void
  setIsAiPanelOpen: (val: boolean) => void
  handleResolveLog: (logId: string) => void
}

const ITEMS_PER_PAGE = 20

export function TelemetryTable({
  searchQuery,
  setSearchQuery,
  selectedSeverity,
  setSelectedSeverity,
  showResolvedMode,
  setShowResolvedMode,
  densityMode,
  setDensityMode,
  filteredLogs,
  expandedLogId,
  setExpandedLogId,
  newLogIds,
  setAiAnalysisLog,
  setIsAiPanelOpen,
  handleResolveLog
}: TelemetryTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // Slice logs for pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE)
  const start = (currentPage - 1) * ITEMS_PER_PAGE
  const displayedLogs = filteredLogs.slice(start, start + ITEMS_PER_PAGE)

  // Reset pagination when filters change significantly to ensure user sees top results
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedSeverity, showResolvedMode])

  return (
    <div className="rounded-xl border border-neutral-200/50 bg-white shadow-sm dark:border-neutral-800/50 dark:bg-neutral-900/50 overflow-hidden">
      {/* Sticky filter, density controls row */}
      <div className="border-b border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-800/50 dark:bg-neutral-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search input field */}
          <div className="relative w-full sm:w-55">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 rounded py-1 pl-8 pr-2.5 outline-none dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
              placeholder="Search logs message/URL..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Level selector dropdown */}
          <select
            value={selectedSeverity || ""}
            onChange={e => setSelectedSeverity(e.target.value || null)}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded py-1 px-2.5 text-xs text-neutral-600 dark:text-neutral-400 outline-none"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="ERROR">Errors Only</option>
            <option value="WARNING">Warnings Only</option>
            <option value="INFO">Info Only</option>
          </select>

          {/* Resolved Filter */}
          <div className="flex rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5">
            {(["unresolved", "resolved", "all"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setShowResolvedMode(mode)}
                className={`rounded px-2 py-0.5 text-[10px] capitalize transition-all ${
                  showResolvedMode === mode
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 font-semibold"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Density toggle buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-neutral-400 font-medium">Density:</span>
          <div className="flex rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5 font-mono text-[9px]">
            <button
              onClick={() => setDensityMode("comfortable")}
              className={`rounded px-2.5 py-0.5 transition-all ${
                densityMode === "comfortable"
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 font-semibold"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Comfortable
            </button>
            <button
              onClick={() => setDensityMode("compact")}
              className={`rounded px-2.5 py-0.5 transition-all ${
                densityMode === "compact"
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-200 font-semibold"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Table wrapper */}
      <div className="telemetry-scrollbar overflow-hidden">
        <Table className="border-collapse table-fixed">
          <TableHeader className="bg-neutral-50/50 dark:bg-neutral-950/20 border-b border-neutral-100 dark:border-neutral-800/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-9 py-2.5 px-3 w-25 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Level</TableHead>
              <TableHead className="h-9 py-2.5 px-3 w-35 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Timestamp</TableHead>
              <TableHead className="h-9 py-2.5 px-3 w-50 truncate text-[10px] uppercase font-bold text-neutral-400 tracking-wider">URL Route</TableHead>
              <TableHead className="h-9 py-2.5 px-3 w-[45%] text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Message</TableHead>
              <TableHead className="h-9 py-2.5 px-3 text-right w-25 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
            {displayedLogs.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12 text-center text-xs text-neutral-400 dark:text-neutral-500 border-none">
                  No telemetry logs match the current search or filters.
                </TableCell>
              </TableRow>
            ) : (
              displayedLogs.map(log => {
                const isExpanded = expandedLogId === log.id
                const isNew = newLogIds.has(log.id)
                
                const levelColor = 
                  log.level === "CRITICAL" ? "text-violet-500 dark:text-violet-400" :
                  log.level === "ERROR" ? "text-rose-500 dark:text-rose-400" :
                  log.level === "WARNING" ? "text-amber-500 dark:text-amber-400" :
                  "text-emerald-500 dark:text-emerald-400"

                const levelBg = 
                  log.level === "CRITICAL" ? "bg-violet-500/10" :
                  log.level === "ERROR" ? "bg-rose-500/10" :
                  log.level === "WARNING" ? "bg-amber-500/10" :
                  "bg-emerald-500/10"

                return (
                  <React.Fragment key={log.id}>
                    {/* Main Row */}
                    <TableRow
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className={cn(
                        "cursor-pointer transition-all border-neutral-150 dark:border-neutral-800/40",
                        isExpanded ? "bg-neutral-50/30 dark:bg-neutral-800/5" : "",
                        isNew ? "animate-flash-new" : "",
                        densityMode === "compact" ? "leading-tight" : "leading-normal"
                      )}
                    >
                      {/* Level Column */}
                      <TableCell className={cn("px-3", densityMode === "compact" ? "py-1.5" : "py-2.5")}>
                        <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold", levelBg, levelColor)}>
                          <span className={cn("h-1 w-1 rounded-full", 
                            log.level === "CRITICAL" ? "bg-violet-500" :
                            log.level === "ERROR" ? "bg-rose-500" :
                            log.level === "WARNING" ? "bg-amber-500" : "bg-emerald-500"
                          )} />
                          {log.level}
                        </span>
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className={cn("px-3 text-neutral-400", densityMode === "compact" ? "py-1.5" : "py-2.5")}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        <span className="text-[9px] ml-1 opacity-60">
                          {new Date(log.createdAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}
                        </span>
                      </TableCell>

                      {/* URL route */}
                      <TableCell className={cn("px-3 truncate text-neutral-400", densityMode === "compact" ? "py-1.5" : "py-2.5")}>
                        {log.url ? log.url.replace("https://api.logstreamops.com", "").replace("https://logstreamops.com", "") : "/"}
                      </TableCell>

                      {/* Message Preview */}
                      <TableCell className={cn("px-3 truncate font-medium text-neutral-800 dark:text-neutral-200", 
                        densityMode === "compact" ? "py-1.5" : "py-2.5"
                      )}>
                        {log.message}
                      </TableCell>

                      {/* Row Actions */}
                      <TableCell className={cn("px-3 text-right", densityMode === "compact" ? "py-1.5" : "py-2.5")}>
                        <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setAiAnalysisLog(log)
                              setIsAiPanelOpen(true)
                            }}
                            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-indigo-500 hover:text-indigo-600"
                            title="View AI Diagnostics analysis"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </button>
                          {!log.resolved && (
                            <button
                              onClick={() => handleResolveLog(log.id)}
                              className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-emerald-500"
                              title="Resolve log event"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Detail Panel row */}
                    {isExpanded && (
                      <TableRow className="bg-neutral-50/10 dark:bg-neutral-900/10 hover:bg-neutral-50/10 dark:hover:bg-neutral-900/10 border-neutral-150 dark:border-neutral-800/40">
                        <TableCell colSpan={5} className="px-6 py-4">
                          <div className="space-y-4 text-xs font-mono">
                            {/* Top detail metadata flags */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] text-neutral-400">
                              <div>
                                <span className="block font-semibold uppercase text-neutral-500">Event ID</span>
                                <span className="text-neutral-800 dark:text-neutral-200">{log.id}</span>
                              </div>
                              <div>
                                <span className="block font-semibold uppercase text-neutral-500">Client Endpoint URL</span>
                                <span className="text-neutral-800 dark:text-neutral-200 break-all">{log.url || "N/A"}</span>
                              </div>
                              <div>
                                <span className="block font-semibold uppercase text-neutral-500">Browser Environment</span>
                                <span className="text-neutral-800 dark:text-neutral-200">{log.browser || "N/A"}</span>
                              </div>
                              <div>
                                <span className="block font-semibold uppercase text-neutral-500">Operating System</span>
                                <span className="text-neutral-800 dark:text-neutral-200">{log.os || "N/A"}</span>
                              </div>
                            </div>

                            {/* Error stack trace box */}
                            {log.stackTrace ? (
                              <div>
                                <span className="block text-[10px] font-semibold text-neutral-400 uppercase mb-1">
                                  Exception Stack Trace
                                </span>
                                <pre className="p-3 rounded-lg border border-rose-200/50 bg-rose-50/5 dark:border-rose-800/30 dark:bg-rose-950/5 text-rose-600 dark:text-rose-400 text-[10px] overflow-x-auto telemetry-scrollbar leading-normal">
                                  <code>{log.stackTrace}</code>
                                </pre>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-neutral-400 text-[10px]">
                                <Info className="h-3 w-3" />
                                <span>No stack trace was attached for this message.</span>
                              </div>
                            )}

                            {/* Diagnostics action bar */}
                            <div className="flex items-center gap-2 border-t border-neutral-200/30 pt-3 dark:border-neutral-800/30">
                              <button
                                onClick={() => {
                                  setAiAnalysisLog(log)
                                  setIsAiPanelOpen(true)
                                }}
                                className="inline-flex h-8 items-center gap-1.5 rounded bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-3 text-[10px] font-semibold text-white shadow-sm transition-colors"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                Run AI Root Cause Analysis
                              </button>
                              {!log.resolved && (
                                <button
                                  onClick={() => handleResolveLog(log.id)}
                                  className="inline-flex h-8 items-center gap-1.5 rounded border border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 px-3 text-[10px] font-semibold shadow-sm transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  Acknowledge & Mark Resolved
                                </button>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                )
              })
            )}
            {displayedLogs.length > 0 && displayedLogs.length < ITEMS_PER_PAGE && Array.from({ length: ITEMS_PER_PAGE - displayedLogs.length }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="hover:bg-transparent border-none opacity-0 select-none pointer-events-none">
                <TableCell colSpan={5} className={cn(densityMode === "compact" ? "py-1.5" : "py-2.5")}>
                  &nbsp;
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-3 border-t border-neutral-100 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-950/10 flex items-center justify-between">
          <div className="text-[10px] text-neutral-500 font-medium">
            Showing <span className="font-bold text-neutral-800 dark:text-neutral-200">{start + 1}</span> to <span className="font-bold text-neutral-800 dark:text-neutral-200">{Math.min(start + ITEMS_PER_PAGE, filteredLogs.length)}</span> of <span className="font-bold text-neutral-800 dark:text-neutral-200">{filteredLogs.length}</span> logs
          </div>
          
          <Pagination className="w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={cn("text-[10px]", currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer")}
                />
              </PaginationItem>
              
              <div className="flex items-center px-2 text-[10px] font-medium text-neutral-500">
                Page <span className="mx-1 font-bold text-neutral-900 dark:text-neutral-100">{currentPage}</span> of <span className="ml-1">{totalPages}</span>
              </div>

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={cn("text-[10px]", currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
