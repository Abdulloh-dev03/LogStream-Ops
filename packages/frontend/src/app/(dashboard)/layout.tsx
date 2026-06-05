"use client"

import React, { useState } from "react"
import { Activity, LayoutGrid, Terminal, Plus, HelpCircle, Copy, CheckCheck, ShieldAlert, KeyRound, Trash2, AlertCircle } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { AiPanel } from "@/components/ai-panel"
import { CommandPalette } from "@/components/command-palette"
import { DashboardProvider, useDashboard } from "@/context/dashboard-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    projects,
    currentProject,
    setCurrentProject,
    setIsAddProjectOpen,
    currentEnv,
    setCurrentEnv,
    isStreaming,
    setIsStreaming,
    isSimulatedMode,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isAiPanelOpen,
    setIsAiPanelOpenState,
    aiAnalysisLog,
    handleCommandPaletteAction,
    isAddProjectOpen,
    newProjectName,
    setNewProjectName,
    handleCreateProject,
    activeSecretKey,
    clearSecretKey,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    projectToDelete,
    setProjectToDelete,
    handleDeleteProject,
    mounted
  } = useDashboard()

  const [copied, setCopied] = useState(false)

  const handleCopyKey = () => {
    if (activeSecretKey) {
      navigator.clipboard.writeText(activeSecretKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      clearSecretKey()
      setCopied(false)
    }
    setIsAddProjectOpen(open)
  }

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Activity className="h-6 w-6 animate-pulse text-indigo-500" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <DashboardSidebar
          projects={projects}
          currentProject={currentProject}
          setCurrentProject={setCurrentProject}
          setIsAddProjectOpen={setIsAddProjectOpen}
          currentEnv={currentEnv}
          setCurrentEnv={setCurrentEnv}
          isStreaming={isStreaming}
          isSimulatedMode={isSimulatedMode}
        />

        <SidebarInset className="flex flex-col bg-background h-screen overflow-hidden">
          <DashboardHeader 
            setIsCommandPaletteOpen={setIsCommandPaletteOpen}
            isStreaming={isStreaming}
            setIsStreaming={setIsStreaming}
          />

          <DashboardShell>
            {children}
          </DashboardShell>
        </SidebarInset>

        <AiPanel
          isOpen={isAiPanelOpen}
          onClose={() => {
            setIsAiPanelOpenState(false)
          }}
          log={aiAnalysisLog}
          isSimulated={isSimulatedMode}
        />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onSelectAction={handleCommandPaletteAction}
          projects={projects.map(p => ({ id: p.id, name: p.name }))}
        />

        {/* Polished Premium Project Ingestion Dialog — 2-Step Flow */}
        <Dialog open={isAddProjectOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-105 p-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800/80 dark:bg-neutral-950">
            <div className="p-6 space-y-6">
              {/* STEP 1: Create form (shown when no secret key exists) */}
              {!activeSecretKey && (
                <>
                  <DialogHeader className="space-y-1.5">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                      <div className="rounded-md border border-neutral-200/60 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-900">
                        <LayoutGrid className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" />
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Workspace Environment Layer</span>
                    </div>
                    <DialogTitle className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                      Create Project
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Provision a new sandbox ingestion node container to track live device events, stacktraces, and stream real-time pipeline telemetry.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleCreateProject} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="projectName" className="font-mono text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                          Project Identifier Name
                        </Label>
                        <span className="font-mono text-[9px] text-neutral-400 dark:text-neutral-500">Required</span>
                      </div>
                      
                      <div className="relative flex items-center">
                        <Terminal className="absolute left-3 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                        <Input
                          id="projectName"
                          type="text"
                          required
                          placeholder="e.g. gateway-microservice"
                          value={newProjectName}
                          onChange={e => setNewProjectName(e.target.value)}
                          className="h-9 pl-9 font-mono text-xs border-neutral-200 bg-neutral-50/50 shadow-sm focus-visible:ring-1 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900/50"
                        />
                      </div>
                    </div>

                    <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-3 dark:border-neutral-900 dark:bg-neutral-900/20">
                      <div className="flex gap-2.5 items-start">
                        <HelpCircle className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <div className="text-[14px] leading-normal text-neutral-500 dark:text-neutral-400">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-200">Architecture Notice:</span> Creating this container automatically generates target API credential headers (<code className="font-mono text-[10px] bg-neutral-200/50 dark:bg-neutral-800 px-1 rounded">ls_live_*</code>) for immediate connection to WebSocket log pipelines.
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-neutral-100 dark:border-neutral-900">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDialogClose(false)}
                        className="h-8 font-mono text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="h-8 font-mono text-[11px] font-semibold bg-neutral-950 text-white hover:bg-neutral-800 shadow-sm dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                      >
                        <Plus className="mr-1 h-3 w-3 stroke-3" /> Create Project
                      </Button>
                    </DialogFooter>
                  </form>
                </>
              )}

              {/* STEP 2: Secret key reveal (shown after creation) */}
              {activeSecretKey && (
                <>
                  <DialogHeader className="space-y-1.5">
                    <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                      <div className="rounded-md border border-emerald-200/60 bg-emerald-50 p-1 dark:border-emerald-800 dark:bg-emerald-900/50">
                        <KeyRound className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Credential Issued</span>
                    </div>
                    <DialogTitle className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                      Your API Key
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      Copy and store this key securely. It will not be shown again.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Warning Banner */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-700/50 dark:bg-amber-950/30">
                    <div className="flex gap-2.5 items-start">
                      <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div className="text-[14px] leading-normal text-amber-800 dark:text-amber-200">
                        <span className="font-bold">Security Notice:</span> This is the only time this key will be displayed. If you lose it, you will need to regenerate a new one.
                      </div>
                    </div>
                  </div>

                  {/* Key Display */}
                  <div className="relative group">
                    <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs break-all dark:border-neutral-800 dark:bg-neutral-900">
                      <code className="flex-1 text-neutral-800 dark:text-neutral-200 select-all">{activeSecretKey}</code>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyKey}
                        className="h-7 w-7 p-0 shrink-0 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                      >
                        {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>

                  <DialogFooter className="pt-2 border-t border-neutral-100 dark:border-neutral-900">
                    <Button
                      type="button"
                      onClick={() => handleDialogClose(false)}
                      className="h-8 font-mono text-[11px] font-semibold bg-neutral-950 text-white hover:bg-neutral-800 shadow-sm dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200"
                    >
                      Done — I've saved my key
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Polished Delete Confirmation Dialog */}
        <Dialog open={isDeleteModalOpen} onOpenChange={(open) => setIsDeleteModalOpen(open)}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border border-red-200/50 bg-white shadow-2xl dark:border-red-900/30 dark:bg-neutral-950">
            <div className="p-6 space-y-6">
              <DialogHeader className="space-y-1.5">
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                  <div className="rounded-md border border-red-100 bg-red-50 p-1 dark:border-red-900/50 dark:bg-red-950/30">
                    <Trash2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Destructive Action</span>
                </div>
                <DialogTitle className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Delete Project
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  You are about to permanently decommission this ingestion node. This will purge all associated telemetry logs, stacktraces, and AI analysis history.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-red-100 bg-red-50/50 p-4 dark:border-red-900/20 dark:bg-red-950/10">
                <div className="flex gap-3 items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-red-800 dark:text-red-300">
                      Confirm Deletion for:
                    </p>
                    <code className="block rounded bg-red-100/50 px-2 py-1 font-mono text-[10px] font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      {projectToDelete?.name || "unidentified-project"}
                    </code>
                  </div>
                </div>
              </div>

              <div className="text-[14px] text-neutral-400 dark:text-neutral-500 italic px-1">
                Notice: Existing clients using the API key for this project will immediately fail to authenticate with the ingestion pipeline.
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="h-8 font-mono text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    if (projectToDelete) {
                      handleDeleteProject(projectToDelete.id)
                      setIsDeleteModalOpen(false)
                    }
                  }}
                  className="h-8 font-mono text-[11px] font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Confirm Permanent Delete
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarProvider>
    </TooltipProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  )
}