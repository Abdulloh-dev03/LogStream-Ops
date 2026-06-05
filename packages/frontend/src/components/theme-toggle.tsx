"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Laptop } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md border border-neutral-200/50 dark:border-neutral-800/50 bg-transparent animate-pulse" />
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 p-1 backdrop-blur-md dark:bg-neutral-900/50">
      <button
        onClick={() => setTheme("light")}
        className={`rounded-full p-1.5 transition-all ${
          theme === "light"
            ? "bg-white text-neutral-950 shadow-sm dark:bg-neutral-800"
            : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
        }`}
        title="Light Mode"
        aria-label="Light Mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`rounded-full p-1.5 transition-all ${
          theme === "dark"
            ? "bg-white text-neutral-950 shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
            : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
        }`}
        title="Dark Mode"
        aria-label="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`rounded-full p-1.5 transition-all ${
          theme === "system"
            ? "bg-white text-neutral-950 shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
            : "text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50"
        }`}
        title="System Preference"
        aria-label="System Preference"
      >
        <Laptop className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
