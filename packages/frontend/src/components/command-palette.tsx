"use client"

import React, { useEffect, useState, useRef } from "react"
import { Search, Terminal, Settings, Filter, ShieldAlert, Cpu, Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction: (action: string, value?: any) => void
  projects: { id: string; name: string }[]
}

export function CommandPalette({ isOpen, onClose, onSelectAction, projects }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const { setTheme } = useTheme()
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Listen for keyboard Cmd+K or Escape
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Command items list
  const actions = [
    { id: "level-critical", category: "Filter Level", title: "Show Critical Level Logs", icon: ShieldAlert, action: () => onSelectAction("filter-level", "CRITICAL") },
    { id: "level-error", category: "Filter Level", title: "Show Error Level Logs", icon: ShieldAlert, action: () => onSelectAction("filter-level", "ERROR") },
    { id: "level-warning", category: "Filter Level", title: "Show Warning Level Logs", icon: ShieldAlert, action: () => onSelectAction("filter-level", "WARNING") },
    { id: "level-clear", category: "Filter Level", title: "Show All Log Levels", icon: Filter, action: () => onSelectAction("filter-level", null) },
    
    // Switch projects
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      category: "Go To Project",
      title: `Switch to: ${p.name}`,
      icon: Terminal,
      action: () => onSelectAction("switch-project", p.id)
    })),

    // Themes
    { id: "theme-dark", category: "Preferences", title: "Enable Dark Mode", icon: Moon, action: () => { setTheme("dark"); onClose(); } },
    { id: "theme-light", category: "Preferences", title: "Enable Light Mode", icon: Sun, action: () => { setTheme("light"); onClose(); } },
    { id: "theme-system", category: "Preferences", title: "Use System Theme Settings", icon: Laptop, action: () => { setTheme("system"); onClose(); } },

    // Ingestion Simulation
    { id: "sim-trigger", category: "Diagnostics", title: "Inject Mock Outage / Ingest Critical Log", icon: Cpu, action: () => onSelectAction("simulate-outage") }
  ]

  // Filter actions based on query
  const filtered = actions.filter(
    item =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  )

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action()
      }
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh] p-4 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-neutral-200 px-4 py-3.5 dark:border-neutral-800">
          <Search className="mr-3 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
            placeholder="Type a command or search logs (e.g. 'Show Critical', project name)..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
          />
          <kbd className="hidden rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="telemetry-scrollbar max-h-75 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No matching commands or actions found.
            </p>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-all ${
                    isSelected
                      ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50"
                      : "text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400"}`} />
                    <span>{item.title}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                    {item.category}
                  </span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 dark:border-neutral-800/50 dark:bg-neutral-900/50">
          <div className="flex gap-3 text-[10px] text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1 dark:border-neutral-800 dark:bg-neutral-900">↑↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-white px-1 dark:border-neutral-800 dark:bg-neutral-900">Enter</kbd> execute
            </span>
          </div>
          <span className="text-[9px] font-mono text-neutral-400">LogStreamOps v0.1.0</span>
        </div>
      </div>
    </div>
  )
}
