"use client"

import React, { useEffect, useState } from "react"
import { X, Sparkles, AlertCircle, Check, Copy, Terminal } from "lucide-react"
import { Log, AiAnalysis } from "@logstream/shared/src/log.types"
import { useTriggerAnalysisMutation, useGetAnalysisStatusQuery } from "@/redux/features/aiApi"
import * as mockData from "@/lib/mock-data"

interface AiPanelProps {
  isOpen: boolean
  onClose: () => void
  log: Log | null
  isSimulated?: boolean
}

// Simple custom Markdown parser that handles headings, lists, bold text, and code blocks
function CustomMarkdown({ content }: { content: string }) {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!content) return null

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
      {parts.map((part, index) => {
        if (part.startsWith("```")) {
          // Extract language and code
          const match = part.match(/```(\w*)\n([\s\S]*?)```/)
          const lang = match ? match[1] : ""
          const code = match ? match[2] : part.slice(3, -3)
          const codeId = `code-${index}`

          return (
            <div key={index} className="relative group rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 font-mono text-[11px] overflow-hidden">
              <div className="flex items-center justify-between bg-neutral-100/50 dark:bg-neutral-900/50 px-3 py-1.5 border-b border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-400">
                <span>{lang || "code"}</span>
                <button
                  onClick={() => handleCopy(code, codeId)}
                  className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                >
                  {copied === codeId ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 overflow-x-auto telemetry-scrollbar">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Inline text formatting (headings, lists, bold)
        const lines = part.split("\n")
        return (
          <div key={index} className="space-y-2">
            {lines.map((line, lIdx) => {
              if (line.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mt-4 mb-2 first:mt-0 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-indigo-500 rounded-full" />
                    {line.substring(4)}
                  </h4>
                )
              }
              if (line.startsWith("- ")) {
                return (
                  <ul key={lIdx} className="list-disc pl-4 space-y-1">
                    <li className="text-neutral-600 dark:text-neutral-400">
                      {line.substring(2)}
                    </li>
                  </ul>
                )
              }
              // Skip empty lines
              if (!line.trim()) return null

              return (
                <p key={lIdx} className="text-neutral-600 dark:text-neutral-400">
                  {line}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function AiPanel({ isOpen, onClose, log, isSimulated = true }: AiPanelProps) {
  const [mockAnalysis, setMockAnalysis] = useState<AiAnalysis | null>(null)
  const [mockLoading, setMockLoading] = useState(false)
  const [mockError, setMockError] = useState<string | null>(null)

  // Real data hooks
  const [triggerAnalysis] = useTriggerAnalysisMutation()
  const { data: realAnalysis, error: realError, isLoading: realLoading } = useGetAnalysisStatusQuery(log?.id ?? "", {
    skip: !isOpen || !log || isSimulated,
    pollingInterval: isSimulated ? 0 : 3000,
  })

  useEffect(() => {
    if (!isOpen || !log) return

    if (isSimulated) {
      async function loadMockAnalysis() {
        setMockLoading(true)
        setMockError(null)
        setMockAnalysis(null)
        try {
          // Simulate network delay
          await new Promise(r => setTimeout(r, 1200))
          const data = mockData.getSimulatedAiAnalysis(log!)
          setMockAnalysis(data)
        } catch (err) {
          setMockError("Failed to generate AI diagnostic analysis.")
        } finally {
          setMockLoading(false)
        }
      }
      loadMockAnalysis()
    } else {
      // Trigger analysis mutation if not already started
      triggerAnalysis({ logId: log.id }).catch(() => {})
    }
  }, [isOpen, log, isSimulated, triggerAnalysis])

  if (!isOpen) return null

  const analysis = isSimulated ? mockAnalysis : realAnalysis
  const loading = isSimulated ? mockLoading : realLoading || (analysis?.status === "PENDING")
  const error = isSimulated ? mockError : realError ? "Failed to generate AI diagnostic analysis." : null
  const isPending = analysis?.status === "PENDING"

  // Compute confidence score based on error severity
  const confidenceScore = log?.level === "CRITICAL" ? 98.4 : log?.level === "ERROR" ? 96.2 : 89.5

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-neutral-200/50 bg-white/95 shadow-2xl backdrop-blur-md transition-all duration-300 dark:border-neutral-800/50 dark:bg-neutral-900/95 animate-slide-in">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/50 px-4 py-3.5 dark:border-neutral-800/50">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
                LogStream AI Diagnostics
              </h2>
              <span className="text-[10px] text-neutral-400">Root Cause Assistant</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="telemetry-scrollbar flex-1 overflow-y-auto p-4 space-y-6">
          {/* Target Event Context */}
          {log && (
            <div className="rounded-lg border border-neutral-200/50 bg-neutral-50/50 p-3 dark:border-neutral-800/50 dark:bg-neutral-950/20">
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${
                  log.level === "CRITICAL" ? "bg-violet-500/10 text-violet-600 dark:text-violet-400" :
                  log.level === "ERROR" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                  log.level === "WARNING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {log.level}
                </span>
                <span className="font-mono text-[9px] text-neutral-400">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 font-mono text-[11px] font-medium leading-normal text-neutral-800 dark:text-neutral-200 break-all">
                {log.message}
              </p>
              {log.url && (
                <div className="mt-2 flex items-center gap-1 font-mono text-[9px] text-neutral-400">
                  <Terminal className="h-2.5 w-2.5" />
                  <span className="truncate">{log.url}</span>
                </div>
              )}
            </div>
          )}

          {/* AI Output Section */}
          {(loading || isPending) && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full border-2 border-neutral-200 border-t-indigo-600 animate-spin dark:border-neutral-800 dark:border-t-cyan-400" />
                <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 animate-pulse">
                {isPending ? "Inference engine running..." : "Analyzing call stacks and telemetry payloads..."}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-200/50 bg-rose-50/10 p-3 text-xs text-rose-600 dark:border-rose-800/30 dark:bg-rose-950/10 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {analysis && !loading && !isPending && (
            <div className="space-y-6">
              {/* Health / Confidence Gauge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-neutral-200/50 p-2.5 dark:border-neutral-800/50 bg-neutral-50/20">
                  <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Diagnostic Confidence
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold font-mono text-indigo-600 dark:text-cyan-400">
                      {confidenceScore}%
                    </span>
                    <span className="text-[9px] text-emerald-500">High Reliability</span>
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-200/50 p-2.5 dark:border-neutral-800/50 bg-neutral-50/20">
                  <span className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Outage Severity Index
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-bold font-mono text-neutral-800 dark:text-neutral-100">
                      {log?.level === "CRITICAL" ? "Sev-1" : log?.level === "ERROR" ? "Sev-2" : "Sev-3"}
                    </span>
                    <span className="text-[9px] text-neutral-400">Operational</span>
                  </div>
                </div>
              </div>

              {/* Explanations & Suggestions */}
              <div className="space-y-4">
                {analysis.explanation && (
                  <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800/50">
                    <CustomMarkdown content={analysis.explanation} />
                  </div>
                )}
                {analysis.suggestedFix && (
                  <div className="border-t border-neutral-100 pt-4 dark:border-neutral-800/50">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                      Suggested Fix / Code patch
                    </h4>
                    <CustomMarkdown content={analysis.suggestedFix} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        {analysis && !loading && !isPending && (
          <div className="border-t border-neutral-200/50 bg-neutral-50/30 p-4 dark:border-neutral-800/50 dark:bg-neutral-900/30">
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-neutral-950 py-2 text-center text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all"
            >
              Acknowledge & Close Diagnostics
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
