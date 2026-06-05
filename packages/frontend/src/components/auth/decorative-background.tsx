"use client"

import React from "react"
import { cn } from "@/lib/utils"

export function DecorativeBackground({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3%3Ffilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dot Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50 z-10" />
      
      {/* Animated Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full animate-pulse delay-700 z-0" />
      
      {/* Sublte Mesh Gradient (only visible in dark mode) */}
      <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.6_0.1_250/5%),transparent_50%)] z-0" />
    </div>
  )
}
