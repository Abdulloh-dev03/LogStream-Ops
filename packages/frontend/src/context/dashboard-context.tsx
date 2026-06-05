"use client"

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from "react"
import { Log } from "@logstream/shared/src/log.types"
import { Project } from "@logstream/shared/src/project.types"
import { useAuthSession } from "@/hooks/use-auth-session"
import { toast } from "sonner"
import { 
  useGetProjectsQuery, 
  useCreateProjectMutation, 
  useDeleteProjectMutation, 
  useRegenerateApiKeyMutation 
} from "@/redux/features/projectApi"
import { useGetProjectLogsQuery, useGetAllLogsQuery, useResolveLogMutation } from "@/redux/features/logQueryApi"
import { io, Socket } from "socket.io-client"
import { useRouter } from "next/navigation"

// Import from mock-data
import * as mockData from "@/lib/mock-data"

interface DashboardContextType {
  mounted: boolean
  densityMode: "comfortable" | "compact"
  setDensityMode: (m: "comfortable" | "compact") => void
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  currentProject: Project | null
  setCurrentProject: (p: Project | null) => void
  currentEnv: "production" | "staging" | "development"
  setCurrentEnv: (v: "production" | "staging" | "development") => void
  logs: Log[]
  setLogs: React.Dispatch<React.SetStateAction<Log[]>>
  projectLogsPreview: Record<string, Log[]>
  isSimulatedMode: boolean
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void
  newLogIds: Set<string>
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedSeverity: string | null
  setSelectedSeverity: (s: string | null) => void
  showResolvedMode: "all" | "unresolved" | "resolved"
  setShowResolvedMode: (m: "all" | "unresolved" | "resolved") => void
  expandedLogId: string | null
  setExpandedLogId: (id: string | null) => void
  aiAnalysisLog: Log | null
  setAiAnalysisLogState: (l: Log | null) => void
  isAiPanelOpen: boolean
  setIsAiPanelOpenState: (v: boolean) => void
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (v: boolean) => void
  isAddProjectOpen: boolean
  setIsAddProjectOpen: (v: boolean) => void
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (v: boolean) => void
  projectToDelete: Project | null
  setProjectToDelete: (p: Project | null) => void
  newProjectName: string
  setNewProjectName: (name: string) => void
  
  // Secret key (transient — shown once on create/rotate)
  activeSecretKey: string | null
  clearSecretKey: () => void

  // Handlers
  handleResolveLog: (logId: string) => Promise<void>
  handleCreateProject: (e: React.FormEvent) => Promise<void>
  handleRegenerateApiKey: (projectId: string) => Promise<void>
  handleDeleteProject: (projectId: string) => Promise<void>
  handleCommandPaletteAction: (action: string, value?: any) => void
  filteredLogs: Log[]
  kpiData: {
    total: number
    errorRatio: string
    criticalCount: number
    confidenceScore: number
  }
  user: any
  isAuthenticated: boolean
  isCheckingSession: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [densityMode, setDensityMode] = useState<"comfortable" | "compact">("comfortable")
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  
  // Data States
  const [projectsState, setProjectsState] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentEnv, setCurrentEnv] = useState<"production" | "staging" | "development">("production")
  const [logsState, setLogsState] = useState<Log[]>([])
  const [projectLogsPreview, setProjectLogsPreview] = useState<Record<string, Log[]>>({})
  
  // Auth State
  const { user, isAuthenticated, isCheckingSession } = useAuthSession()
  const isSimulatedMode = !isAuthenticated
  
  // RTK Query hooks
  const { data: realProjects, isLoading: isLoadingProjects } = useGetProjectsQuery(undefined, { skip: !isAuthenticated })
  const { data: realAllLogs, isLoading: isLoadingLogs } = useGetAllLogsQuery(undefined, { skip: !isAuthenticated })
  
  const [createProject] = useCreateProjectMutation()
  const [deleteProject] = useDeleteProjectMutation()
  const [regenerateApiKey] = useRegenerateApiKeyMutation()

  // Real-time stream states
  const [isStreaming, setIsStreaming] = useState(true)
  const [newLogIds, setNewLogIds] = useState<Set<string>>(new Set()) // Tracks new logs for highlight animations

  // Filtering states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [showResolvedMode, setShowResolvedMode] = useState<"all" | "unresolved" | "resolved">("unresolved")
  
  // Details/Side Panel states
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [aiAnalysisLog, setAiAnalysisLogState] = useState<Log | null>(null)
  const [isAiPanelOpen, setIsAiPanelOpenState] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
  
  // Modals
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [activeSecretKey, setActiveSecretKey] = useState<string | null>(null)
  const clearSecretKey = () => setActiveSecretKey(null)

  // Initialize mock data only once
  const initialMockLogsRef = useRef<Record<string, Log[]>>({})
  
  // Mount logic
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset project state when authentication changes to prevent state leakage
  useEffect(() => {
    setCurrentProject(null)
    setProjectsState([])
    setLogsState([])
    setProjectLogsPreview({})
    setExpandedLogId(null)
    setAiAnalysisLogState(null)
    setNewLogIds(new Set())
    setSearchQuery("")
    setSelectedSeverity(null)
    initialMockLogsRef.current = {}
  }, [isAuthenticated])

  // Handle projects data sync
  useEffect(() => {
    if (isAuthenticated) {
      if (realProjects) {
        setProjectsState(realProjects)
        if (realProjects.length > 0 && !currentProject) {
          setCurrentProject(realProjects[0])
        }
      }
    } else {
      // Mock mode: Initialize mock projects if not already set
      const mocks = mockData.MOCK_PROJECTS.map(p => ({
        ...p,
        userId: "mock-user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })) as Project[]
      setProjectsState(mocks)
      if (!currentProject) {
        setCurrentProject(mocks[0])
      }
    }
  }, [isAuthenticated, realProjects, currentProject])

  // Handle logs data sync
  useEffect(() => {
    if (isAuthenticated) {
      if (realAllLogs) {
        setLogsState(realAllLogs.logs)
        const initialPreviews: Record<string, Log[]> = {}
        projectsState.forEach(p => {
          initialPreviews[p.id] = realAllLogs.logs.filter(l => l.projectId === p.id).slice(0, 5)
        })
        setProjectLogsPreview(initialPreviews)
      } else {
        setLogsState([])
        setProjectLogsPreview({})
      }
    } else {
      // Mock mode
      if (projectsState.length > 0) {
        if (Object.keys(initialMockLogsRef.current).length === 0) {
          const combinedLogs: Log[] = []
          projectsState.forEach(p => {
            initialMockLogsRef.current[p.id] = mockData.generateInitialLogs(p.id, 15)
            combinedLogs.push(...initialMockLogsRef.current[p.id])
          })
          combinedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setLogsState(combinedLogs)

          const initialPreviews: Record<string, Log[]> = {}
          projectsState.forEach(p => {
            initialPreviews[p.id] = initialMockLogsRef.current[p.id].slice(0, 5)
          })
          setProjectLogsPreview(initialPreviews)
        }
      } else {
        setLogsState([])
        setProjectLogsPreview({})
      }
    }
  }, [isAuthenticated, realAllLogs, projectsState])

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Set up global client-side socket connection (Real mode)
  useEffect(() => {
    if (!isAuthenticated || projectsState.length === 0 || !isStreaming) {
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    let socketUrl = baseUrl
    try {
      const url = new URL(baseUrl)
      socketUrl = url.origin
    } catch {
      if (!baseUrl.startsWith('http')) {
        socketUrl = window.location.origin
      }
    }

    const socket = io(socketUrl, {
      query: { projectId: projectsState.map(p => p.id).join(",") },
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('new_log', (newLog: Log) => {
      setLogsState(prev => [newLog, ...prev])
      setProjectLogsPreview(prev => {
        const currentQueue = prev[newLog.projectId] || []
        return {
          ...prev,
          [newLog.projectId]: [newLog, ...currentQueue].slice(0, 5)
        }
      })
      setNewLogIds(prev => {
        const next = new Set(prev)
        next.add(newLog.id)
        return next
      })
      setTimeout(() => {
        setNewLogIds(prev => {
          const next = new Set(prev)
          next.delete(newLog.id)
          return next
        })
      }, 1500)
    })

    socket.on('log_resolved', (updatedLog: Log) => {
      setLogsState(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l))
      setProjectLogsPreview(prev => {
        const currentQueue = prev[updatedLog.projectId] || []
        const updatedQueue = currentQueue.map(l => l.id === updatedLog.id ? updatedLog : l)
        return {
          ...prev,
          [updatedLog.projectId]: updatedQueue
        }
      })
    })

    return () => {
      socket.close()
      socketRef.current = null
    }
  }, [isAuthenticated, projectsState, isStreaming])

  // Real-time simulation stream loop (Mock only)
  useEffect(() => {
    if (!isStreaming || projectsState.length === 0 || !isSimulatedMode) return

    const interval = setInterval(() => {
      const randomProject = projectsState[Math.floor(Math.random() * projectsState.length)]
      const freshLog = mockData.generateRandomLog(randomProject.id)
      
      setLogsState(prev => [freshLog, ...prev])
      setProjectLogsPreview(prev => {
        const currentQueue = prev[randomProject.id] || []
        return {
          ...prev,
          [randomProject.id]: [freshLog, ...currentQueue].slice(0, 5)
        }
      })

      setNewLogIds(prev => {
        const next = new Set(prev)
        next.add(freshLog.id)
        return next
      })

      setTimeout(() => {
        setNewLogIds(prev => {
          const next = new Set(prev)
          next.delete(freshLog.id)
          return next
        })
      }, 1500)

    }, Math.floor(Math.random() * 4000) + 3000)

    return () => clearInterval(interval)
  }, [isStreaming, projectsState, isSimulatedMode])

  const [resolveLog] = useResolveLogMutation()

  const handleResolveLog = async (logId: string) => {
    if (!isAuthenticated) {
      setLogsState(prev => prev.map(l => l.id === logId ? { ...l, resolved: true } : l))
      setProjectLogsPreview(prev => {
        const updated: Record<string, Log[]> = {}
        Object.keys(prev).forEach(projId => {
          updated[projId] = prev[projId].map(l => l.id === logId ? { ...l, resolved: true } : l)
        })
        return updated
      })
      toast.success("Telemetry event resolved (Simulated).")
      return
    }

    try {
      const updatedLog = await resolveLog({ logId, resolved: true }).unwrap()
      setLogsState(prev => prev.map(l => l.id === logId ? { ...l, resolved: true } : l))
      setProjectLogsPreview(prev => {
        const currentQueue = prev[updatedLog.projectId] || []
        const updatedQueue = currentQueue.map(l => l.id === logId ? { ...l, resolved: true } : l)
        return {
          ...prev,
          [updatedLog.projectId]: updatedQueue
        }
      })
      toast.success("Log resolved", {
        description: "The event status has been updated successfully.",
      })
    } catch (err) {
      toast.error("Failed to resolve log", {
        description: "Please check your permissions and try again.",
      })
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please sign in to create new telemetry projects.",
      })
      return
    }
    if (!newProjectName.trim()) return
    try {
      const newProj = await createProject({ name: newProjectName }).unwrap()
      if (newProj.apiKey) setActiveSecretKey(newProj.apiKey)
      setCurrentProject(newProj)
      setNewProjectName("")
      toast.success(`Project "${newProj.name}" created successfully.`)
    } catch (err) {
      toast.error("Failed to create project.")
    }
  }

  const handleRegenerateApiKey = async (projectId: string) => {
    if (!isAuthenticated) return
    try {
      const updatedProj = await regenerateApiKey(projectId).unwrap()
      if (updatedProj.apiKey) setActiveSecretKey(updatedProj.apiKey)
      setIsAddProjectOpen(true) 
      toast.success("API key regenerated successfully.")
    } catch {
      toast.error("Failed to regenerate API key.")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!isAuthenticated) {
      setProjectsState(prev => prev.filter(p => p.id !== projectId))
      setProjectLogsPreview(prev => {
        const next = { ...prev }
        delete next[projectId]
        return next
      })
      if (currentProject?.id === projectId) {
        const remaining = projectsState.filter(p => p.id !== projectId)
        setCurrentProject(remaining.length > 0 ? remaining[0] : null)
      }
      toast.success("Project deleted (Simulated).")
      return
    }
    try {
      await deleteProject(projectId).unwrap()
      setProjectLogsPreview(prev => {
        const next = { ...prev }
        delete next[projectId]
        return next
      })
      if (currentProject?.id === projectId) {
        const remaining = projectsState.filter(p => p.id !== projectId)
        setCurrentProject(remaining.length > 0 ? remaining[0] : null)
      }
      toast.success("Project deleted successfully.")
    } catch {
      toast.error("Failed to delete project.")
    }
  }

  const handleCommandPaletteAction = (action: string, value?: any) => {
    if (action === "filter-level") {
      setSelectedSeverity(value)
    } else if (action === "switch-project") {
      router.push(`/projects/${value}/logs`)
    }
    setIsCommandPaletteOpen(false)
  }

  // Filter logs for view
  const filteredLogs = useMemo(() => {
    if (!Array.isArray(logsState)) return [];
    return logsState.filter(log => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesMessage = log.message?.toLowerCase().includes(query) ?? false;
        const matchesUrl = log.url ? log.url.toLowerCase().includes(query) : false;
        if (!matchesMessage && !matchesUrl) return false;
      }
      if (selectedSeverity && log.level !== selectedSeverity) return false;
      if (showResolvedMode === "unresolved" && log.resolved) return false;
      if (showResolvedMode === "resolved" && !log.resolved) return false;
      return true;
    });
  }, [logsState, searchQuery, selectedSeverity, showResolvedMode])

  // Calculations for KPI Cards
  const kpiData = useMemo(() => {
    if (!Array.isArray(logsState) || logsState.length === 0) {
      return { total: 0, errorRatio: "0.00", criticalCount: 0, confidenceScore: 0 };
    }
    const total = logsState.length;
    const errors = logsState.filter(l => l.level === "ERROR" || l.level === "CRITICAL").length;
    const unresolvedCriticals = logsState.filter(l => l.level === "CRITICAL" && !l.resolved).length;
    const ratio = total > 0 ? (errors / total) * 100 : 0;
    return {
      total,
      errorRatio: ratio.toFixed(2),
      criticalCount: unresolvedCriticals,
      confidenceScore: total > 0 ? 94.6 : 0,
    };
  }, [logsState])

  const value = {
    mounted,
    densityMode,
    setDensityMode,
    projects: projectsState,
    setProjects: setProjectsState,
    currentProject,
    setCurrentProject,
    currentEnv,
    setCurrentEnv,
    logs: logsState,
    setLogs: setLogsState,
    projectLogsPreview,
    isSimulatedMode,
    isStreaming,
    setIsStreaming,
    newLogIds,
    searchQuery,
    setSearchQuery,
    selectedSeverity,
    setSelectedSeverity,
    showResolvedMode,
    setShowResolvedMode,
    expandedLogId,
    setExpandedLogId,
    aiAnalysisLog,
    setAiAnalysisLogState,
    isAiPanelOpen,
    setIsAiPanelOpenState,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isAddProjectOpen,
    setIsAddProjectOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    projectToDelete,
    setProjectToDelete,
    newProjectName,
    setNewProjectName,
    activeSecretKey,
    clearSecretKey,
    handleResolveLog,
    handleCreateProject,
    handleRegenerateApiKey,
    handleDeleteProject,
    handleCommandPaletteAction,
    filteredLogs,
    kpiData,
    user,
    isAuthenticated,
    isCheckingSession
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
