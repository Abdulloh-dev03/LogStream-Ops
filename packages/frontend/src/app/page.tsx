'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Terminal,
  Sparkles,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Play,
  BarChart2,
  Activity,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ERROR_TEMPLATES } from '@/lib/mock-data';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [showAiReport, setShowAiReport] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Container ref to scope our GSAP selectors safely
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup landing page logs simulation
  useEffect(() => {
    const sampleLogs = ERROR_TEMPLATES.map((item, idx) => ({
      id: `log-landing-${idx}`,
      message: item.message,
      level: item.level,
      url: item.url,
      createdAt: new Date(Date.now() - idx * 2 * 60 * 1000).toISOString(),
    }));
    setLogs(sampleLogs);
  }, []);

  // Auto-cycle logs in the preview panel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % ERROR_TEMPLATES.length);
      setShowAiReport(false);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // GSAP Animations (Hero + ScrollTrigger sections)
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1️⃣ Hero Entrance Sequence (Runs immediately on load)
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.9 } });

      heroTl.from('.animate-badge', {
        opacity: 0,
        y: -20,
        delay: 0.2,
      })
      .from('.animate-title', {
        opacity: 0,
        y: 30,
      }, '-=0.6')
      .from('.animate-desc', {
        opacity: 0,
        y: 20,
      }, '-=0.6')
      .from('.animate-ctas', {
        opacity: 0,
        y: 15,
      }, '-=0.6')
      .from('.animate-sandbox', {
        opacity: 0,
        y: 40,
        duration: 1.1,
      }, '-=0.4');

      // 2️⃣ Features Section Scroll Trigger
      gsap.from('.animate-features-header', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#features',
          start: 'top 80%', // Triggers when the top of #features section hits 80% of the screen height
          toggleActions: 'play none none none',
        }
      });

      gsap.from('.animate-feature-card', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15, // Creates a beautiful cascading reveal effect between the cards
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 75%',
          toggleActions: 'play none none none',
        }
      });

      // 3️⃣ Architecture Section Scroll Trigger
      const archTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#architecture',
          start: 'top 75%',
          toggleActions: 'play none none none',
        }
      });

      archTl.from('.animate-arch-header', {
        opacity: 0,
        x: -20,
        duration: 0.6,
        ease: 'power2.out'
      })
      .from('.animate-arch-left', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power3.out'
      }, '-=0.3')
      .from('.animate-arch-right', {
        opacity: 0,
        x: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.5');

    }, containerRef);

    return () => ctx.revert(); // Cleans up animations and kills all ScrollTriggers automatically
  }, []);

  const activeTemplate = ERROR_TEMPLATES[activeLogIndex];

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground transition-all duration-300 bg-grid-pattern relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 left-1/2 -z-10 h-125 w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(circle_at_top,oklch(0.6_0.1_250/8%),transparent_60%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-neutral-200/50 bg-white/70 backdrop-blur-md dark:border-neutral-800/50 dark:bg-neutral-900/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neutral-950 p-1.5 dark:bg-neutral-50">
              <Activity className="h-4 w-4 text-white dark:text-black" />
            </div>
            <div>
              <span className="font-mono text-sm font-bold tracking-tight">LogStreamOps</span>
              <span className="ml-1.5 rounded bg-indigo-500/10 px-1 py-0.5 font-mono text-[8px] font-semibold text-indigo-600 dark:text-indigo-400">
                v0.1.0-beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-neutral-950 px-3 font-mono text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-sm transition-all"
            >
              <span>Console</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="animate-badge inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Realtime Ingestion & Diagnostics</span>
          </div>

          <h1 className="animate-title text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-gradient-primary">
            Mission-critical observability built for SRE & DevOps teams.
          </h1>

          <p className="animate-desc max-w-xl mx-auto text-sm text-neutral-500 dark:text-neutral-400 sm:text-base leading-relaxed">
            Pipes logs, traces, and host system health checks into a unified, high-density stream.
            Real-time diagnostic LLM automatically predicts root causes and drafts patches.
          </p>

          <div className="animate-ctas flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-6 font-mono text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 shadow-lg shadow-neutral-950/10 dark:shadow-none transition-all"
            >
              <Play className="h-3.5 w-3.5" />
              Launch Live Dashboard
            </Link>
            <a
              href="#architecture"
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-6 font-mono text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300 dark:hover:bg-neutral-900 transition-all"
            >
              <Cpu className="h-3.5 w-3.5" />
              Explore AI Diagnostics
            </a>
          </div>
        </div>

        {/* Live Dashboard Simulation Widget */}
        <section className="animate-sandbox mt-20 rounded-2xl border border-neutral-200/50 bg-white/50 p-4 shadow-xl backdrop-blur-md dark:border-neutral-800/50 dark:bg-neutral-950/20 lg:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-4 dark:border-neutral-800/50">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
                LogStream Live Node Ingestion Sandbox
              </span>
            </div>
            <div className="flex gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Log Stream Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                <span>INGESTED EVENTS</span>
                <span>AUTO-CYCLING IN 8s</span>
              </div>

              <div className="space-y-1.5 overflow-hidden rounded-lg bg-neutral-50/50 dark:bg-neutral-950/30 p-2 border border-neutral-200/30 dark:border-neutral-800/30">
                {logs.map((log, idx) => {
                  const isActive = idx === activeLogIndex;
                  return (
                    <button
                      key={log.id}
                      onClick={() => {
                        setActiveLogIndex(idx);
                        setShowAiReport(true);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded transition-all font-mono text-[10px] ${
                        isActive
                          ? 'bg-neutral-200/50 dark:bg-neutral-800/80 text-neutral-950 dark:text-white border-l-2 border-indigo-500 pl-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          log.level === 'CRITICAL'
                            ? 'bg-violet-500'
                            : log.level === 'ERROR'
                              ? 'bg-rose-500'
                              : log.level === 'WARNING'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                        }`}
                      />
                      <span className="text-neutral-400 hidden sm:inline">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                      <span className="truncate flex-1 font-semibold">{log.message}</span>
                      <span className="text-neutral-400 text-[9px] uppercase tracking-wider">
                        {log.level}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Ingestion Sparkline Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-neutral-200/30 bg-neutral-50/30 p-3 dark:border-neutral-800/30 dark:bg-neutral-950/10">
                  <span className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Ingest Rate
                  </span>
                  <span className="font-mono text-sm font-bold dark:text-neutral-200">
                    1.2k/sec
                  </span>
                </div>
                <div className="rounded-lg border border-neutral-200/30 bg-neutral-50/30 p-3 dark:border-neutral-800/30 dark:bg-neutral-950/10">
                  <span className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Error Ratio
                  </span>
                  <span className="font-mono text-sm font-bold text-rose-500">0.02%</span>
                </div>
                <div className="rounded-lg border border-neutral-200/30 bg-neutral-50/30 p-3 dark:border-neutral-800/30 dark:bg-neutral-950/10">
                  <span className="block text-[9px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Node Latency
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-500">2ms</span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics Analyzer Column */}
            <div className="lg:col-span-5 flex flex-col border border-neutral-200/50 bg-neutral-50/30 rounded-xl overflow-hidden dark:border-neutral-800/50 dark:bg-neutral-950/20">
              <div className="flex items-center justify-between bg-neutral-100/50 dark:bg-neutral-900/30 px-4 py-2.5 border-b border-neutral-200/50 dark:border-neutral-800/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                  <span className="font-mono text-[10px] font-bold text-neutral-800 dark:text-neutral-100 uppercase tracking-wider">
                    LogStream AI Engine
                  </span>
                </div>
                <button
                  onClick={() => setShowAiReport(true)}
                  className="rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-semibold px-2 py-0.5 transition-colors"
                >
                  Analyze Event
                </button>
              </div>

              <div className="flex-1 p-4 font-mono text-[10px] space-y-4">
                {showAiReport ? (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">
                        Root Cause
                      </span>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1 leading-relaxed">
                        {activeTemplate.explanation.replace(
                          /### Root Cause Analysis\n|### Diagnostics/g,
                          '',
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase font-bold tracking-wider">
                        Suggested Patch
                      </span>
                      <pre className="mt-1.5 p-3 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 overflow-x-auto text-[9px] text-neutral-700 dark:text-neutral-300 telemetry-scrollbar leading-normal">
                        <code>
                          {activeTemplate.suggestedFix.replace(/```typescript\n|```/g, '')}
                        </code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="rounded-full bg-neutral-100 p-3 dark:bg-neutral-800/50">
                      <Terminal className="h-5 w-5 text-neutral-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-600 dark:text-neutral-300">
                        No active diagnosis loaded
                      </p>
                      <p className="text-neutral-400 text-[9px] mt-1">
                        Select any ingestion event on the left, or click &quot;Analyze Event&quot;
                        to test the AI engine.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Matrix Grid */}
        <section id="features" className="mt-32 space-y-16">
          <div className="animate-features-header text-center space-y-4">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
              Dev-Tool Capabilities
            </h2>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Optimized for production debugging sessions. Speed, density, and clarity.
            </p>
          </div>

          <div className="features-grid grid-cols-1 md:grid-cols-3 gap-6 grid">
            {/* Feature Cards with sequential stagger hook */}
            <div className="animate-feature-card rounded-xl border border-neutral-200/50 bg-white/30 p-5 dark:border-neutral-800/50 dark:bg-neutral-900/30 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500 flex items-center justify-center">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Density Telemetry Streams
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Choose between comfortable and compact display densities. Virtualized scrolling
                keeps thousand-line streams scrolling at 60 FPS.
              </p>
            </div>

            <div className="animate-feature-card rounded-xl border border-neutral-200/50 bg-white/30 p-5 dark:border-neutral-800/50 dark:bg-neutral-900/30 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Automated Root Cause LLM
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Translates stack traces, request URLs, and browser environments directly into
                actionable markdown reports containing git diff solutions.
              </p>
            </div>

            <div className="animate-feature-card rounded-xl border border-neutral-200/50 bg-white/30 p-5 dark:border-neutral-800/50 dark:bg-neutral-900/30 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 p-1.5 text-rose-500 flex items-center justify-center">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                Command Palette & Switchers
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Filter by severities, toggle workspace themes, check environment runtimes, and
                simulate hardware loads instantly using a globally bound command bar.
              </p>
            </div>
          </div>
        </section>

        {/* Specs and Technical Architecture */}
        <section
          id="architecture"
          className="mt-32 rounded-2xl border border-neutral-200/50 bg-white/30 p-6 dark:border-neutral-800/50 dark:bg-neutral-950/10 space-y-8"
        >
          <div className="animate-arch-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200/50 pb-6 dark:border-neutral-800/50">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-100">
                Enterprise Telemetry API
              </h2>
              <span className="text-[10px] text-neutral-400 font-mono">
                Simple curl or library integration
              </span>
            </div>
            <div className="flex gap-2">
              <span className="rounded bg-neutral-200 px-2 py-0.5 font-mono text-[9px] font-semibold dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                POST /api/ingest
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-600">
                Active
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="animate-arch-left lg:col-span-5 space-y-4">
              <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                Piping structured node errors
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                LogStreamOps exposes an ingestion pipeline matching standard Zod schemas. Stream
                crashes right from your React apps, Next.js routers, Express servers, or Kubernetes
                containers.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Validates API live ingestion keys (`ls_live_...`)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Attaches detailed browser and OS agents</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Tracks path, routes, and custom payload stacks</span>
                </div>
              </div>
            </div>

            <div className="animate-arch-right lg:col-span-7 bg-neutral-900 rounded-xl p-4 border border-neutral-800 text-[10px] font-mono text-neutral-300 relative group overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3 text-neutral-500">
                <span>INGESTION CURL COMMAND</span>
                <span className="text-[9px]">application/json</span>
              </div>
              <pre className="overflow-x-auto telemetry-scrollbar text-emerald-400">
                <code>{`curl -X POST https://api.logstreamops.com/api/ingest \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "ls_live_a8f9b9c9d9e9f9091",
    "message": "Database connection limit reached",
    "level": "CRITICAL",
    "url": "https://api.myapp.com/v1/users",
    "stackTrace": "Error: connection timeout at pg/pool.js:80:12"
  }'`}</code>
              </pre>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t border-neutral-200/50 bg-white/50 dark:border-neutral-800/50 dark:bg-neutral-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">
              LogStreamOps
            </span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex gap-4">
            <p>All rights reserved.</p>
          </div>

          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <span>Abdulloh Ortiqov</span>
            <span>&amp;</span>
            <Sparkles className="h-3 w-3 text-indigo-500" />
          </div>
        </div>
      </footer>
    </div>
  );
}