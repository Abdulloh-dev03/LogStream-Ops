"use client"

import React from "react"
import Link from "next/link"
import { Activity, Sparkles, ShieldCheck, Cpu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { DecorativeBackground } from "./decorative-background"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Side: Branding & Visuals (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-neutral-50 dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800">
        <DecorativeBackground />
        
        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-lg bg-neutral-950 p-2 dark:bg-neutral-50 shadow-lg">
            <Activity className="h-6 w-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
              LogStreamOps
            </h1>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
              Enterprise Observability
            </span>
          </div>
        </div>

        {/* Center: Hero/Feature Visual */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Root Cause Analysis</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight text-gradient-primary leading-tight">
              Observe everything.<br />Resolve faster.
            </h2>
            <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              LogStreamOps provides real-time telemetry streaming and predictive diagnostics for modern engineering teams.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Zero-Trust Security</h3>
              <p className="text-xs text-neutral-500">Encrypted ingestion pipelines for enterprise data.</p>
            </div>
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm">
                <Cpu className="h-5 w-5 text-indigo-500" />
              </div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">Predictive Engine</h3>
              <p className="text-xs text-neutral-500">Detect anomalies before they become outages.</p>
            </div>
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>v0.1.0-beta</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile Header (Visible on mobile only) */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
           <Activity className="h-5 w-5 text-neutral-900 dark:text-neutral-50" />
           <span className="font-mono text-sm font-bold">LogStreamOps</span>
        </div>

        {/* Theme Toggle (Absolute top right) */}
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {title}
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
