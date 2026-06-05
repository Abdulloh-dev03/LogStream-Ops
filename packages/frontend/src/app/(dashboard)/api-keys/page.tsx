"use client"

import React, { useState } from "react"
import { useDashboard } from "@/context/dashboard-context"
import { Key, Check, Copy, RefreshCw, Eye, EyeOff, ShieldAlert, Terminal } from "lucide-react"
import { toast } from "sonner"

export default function ApiKeysPage() {
  const { projects, isSimulatedMode, handleRegenerateApiKey } = useDashboard()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingProjectId, setLoadingProjectId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success("Copied to clipboard")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const onRotateKey = async (projectId: string) => {
    setLoadingProjectId(projectId)
    await handleRegenerateApiKey(projectId)
    setLoadingProjectId(null)
  }

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
          <Key className="h-5 w-5 text-indigo-500" />
          API Credentials & Keys
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Secure tokens used by external servers or client devices to push logs streams and telemetry data to your workspaces.
        </p>
      </div>

      {/* Warning */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 flex items-start gap-3.5 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="font-bold">Protect your API Ingestion Keys</h2>
          <p className="text-sm leading-relaxed text-amber-700 dark:text-amber-400/80">
            These keys grant authorization to ingest error streams on behalf of your projects. Never check them into client-side public git repos, or expose them in browser bundle distributions. Rotate keys if you suspect they are compromised.
          </p>
        </div>
      </div>

      {/* API Keys Table/List */}
      <div className="rounded-xl border border-neutral-200/50 bg-white dark:border-neutral-800/50 dark:bg-neutral-900/50 overflow-hidden">
        <div className="overflow-x-auto telemetry-scrollbar">
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/50 dark:border-neutral-850 text-neutral-450 uppercase tracking-wider font-semibold">
                <th className="p-3.5 pl-5">Project Node</th>
                <th className="p-3.5">API Ingestion Token (Masked)</th>
                <th className="p-3.5">Environment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {projects.map((proj) => {
                const isRotating = loadingProjectId === proj.id
                const displayKey = proj.keyPreview || "ls_live_••••••••"

                return (
                  <tr key={proj.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-colors">
                    <td className="p-3.5 pl-5 font-sans font-bold text-neutral-900 dark:text-white">
                      {proj.name}
                      <span className="block font-mono text-[8px] font-normal text-neutral-400 mt-0.5">
                        ID: {proj.id}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-neutral-600 dark:text-neutral-300">
                      {displayKey}
                    </td>
                    <td className="p-3.5">
                      <span className="rounded bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 font-semibold text-neutral-550 dark:text-neutral-400">
                        {isSimulatedMode ? "Simulated Sandbox" : "Global Scope"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-emerald-500 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right font-sans">
                      <div className="flex justify-end gap-1.5">
                        {/* Copy Key Preview */}
                        <button
                          onClick={() => handleCopy(displayKey, proj.id)}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                          title="Copy Key Preview"
                        >
                          {copiedId === proj.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Rotate Key */}
                        <button
                          onClick={() => onRotateKey(proj.id)}
                          disabled={isRotating}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
                          title="Rotate Ingestion Key"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isRotating ? "animate-spin text-indigo-500" : ""}`} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Integration Guide Section */}
      <div className="rounded-2xl border border-neutral-200/50 bg-white/30 p-6 dark:border-neutral-800/50 dark:bg-neutral-950/10 space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-indigo-500" />
            Direct curl Ingestion Example
          </h2>
          <p className="text-[11px] text-neutral-450 mt-1">
            Test ingestion directly from terminal using your project key token.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-850 rounded-lg p-4 font-mono text-[10px] text-emerald-400 relative group overflow-hidden leading-normal telemetry-scrollbar">
          <pre>{`curl -X POST https://api.logstreamops.com/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${projects[0]?.keyPreview || "ls_live_••••••••"}",
    "message": "Database connection limit reached",
    "level": "CRITICAL",
    "url": "https://api.myapp.com/v1/users",
    "stackTrace": "Error: connection timeout at pg/pool.js:80:12"
  }'`}</pre>
          <button
            onClick={() => handleCopy(`curl -X POST https://api.logstreamops.com/api/ingest \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "apiKey": "${projects[0]?.keyPreview || "ls_live_••••••••"}",\n    "message": "Database connection limit reached",\n    "level": "CRITICAL",\n    "url": "https://api.myapp.com/v1/users",\n    "stackTrace": "Error: connection timeout at pg/pool.js:80:12"\n  }'`, "curl-code")}
            className="absolute right-2 top-2 p-1 rounded bg-neutral-850/50 hover:bg-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 cursor-pointer"
          >
            {copiedId === "curl-code" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
