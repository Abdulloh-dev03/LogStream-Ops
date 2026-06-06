'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/dashboard-context';
import {
  Plus,
  Key,
  Check,
  Copy,
  RefreshCw,
  Trash2,
  ArrowRight,
  Layers,
  Globe,
  ChevronDown,
  Cpu,
  Boxes,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Static configuration payload data import
import snippetsData from './CodeSnippets.json';

type FrameworkKey =
  | 'express'
  | 'nestjs'
  | 'nextjs'
  | 'go'
  | 'python'
  | 'javascript'
  | 'fastify'
  | 'php';

const FRAMEWORK_OPTIONS: { id: FrameworkKey; label: string; runtime: string }[] = [
  { id: 'express', label: 'Express.js Engine', runtime: 'NodeJS / TypeScript' },
  { id: 'nestjs', label: 'NestJS Framework', runtime: 'Enterprise Node Architecture' },
  { id: 'nextjs', label: 'Next.js Route Hooks', runtime: 'Vercel Edge Pipeline' },
  { id: 'go', label: 'Go Routine Core', runtime: 'Native Structural Performance' },
  { id: 'python', label: 'Python FastAPI', runtime: 'Asynchronous Data Gateway' },
  { id: 'javascript', label: 'Vanilla JavaScript', runtime: 'Universal Client Runtime' },
  { id: 'fastify', label: 'Fastify Web Server', runtime: 'High-Throughput V8 Node' },
  { id: 'php', label: 'Standard PHP Server', runtime: 'Standard Curl Telemetry' },
];

export default function ProjectsPage() {
  const {
    projects,
    setIsAddProjectOpen,
    projectLogsPreview,
    handleRegenerateApiKey,
    setIsDeleteModalOpen,
    setProjectToDelete,
  } = useDashboard();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom dropdown states management
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>('express');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const INGESTION_API_URL = 'https://logstream-ops.onrender.com/api/ingest';

  const activeProjectKey = projects[0]?.keyPreview;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Telemetry payload synced to system clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Inject dynamic variables safely into plain static code views
  const getCleanCodeOutput = () => {
    let baseTemplate = snippetsData[selectedFramework] || '';
    return baseTemplate
      .replace(/process\.env\.LOGSTREAM_API_KEY/g, `"${activeProjectKey}"`)
      .replace(/process\.env\.LOGSTREAM_INGEST_URL/g, `"${INGESTION_API_URL}"`);
  };

  const currentSelectionDetails = FRAMEWORK_OPTIONS.find((f) => f.id === selectedFramework);

  return (
    <div className="space-y-8 animate-fade-in max-w-400 mx-auto p-1 select-none">
      {/* 1. Header Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/60 dark:border-neutral-800/60 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 border border-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
            Project Workspace Directory
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor decoupled infrastructure logs, audit environments, and re-route ingestion
            pipelines in real time.
          </p>
        </div>

        <Button
          onClick={() => setIsAddProjectOpen(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 font-mono text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-50 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all shadow-sm hover:scale-[1.01] active:scale-[0.99] shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Provision Project</span>
        </Button>
      </div>

      {/* 2. Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const fullLogsList = projectLogsPreview[proj.id] || [];
          const criticalCount = fullLogsList.filter(
            (l: any) => l.level === 'CRITICAL' || l.level === 'ERROR',
          ).length;
          const warningCount = fullLogsList.filter((l: any) => l.level === 'WARNING').length;
          const infoCount = fullLogsList.filter((l: any) => l.level === 'INFO').length;

          return (
            <Card
              key={proj.id}
              className="flex flex-col border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl overflow-hidden group"
            >
              <CardHeader className="p-5 pb-4 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-900/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 overflow-hidden">
                    <span className="block font-mono text-[9px] uppercase tracking-widest font-bold text-neutral-400 dark:text-neutral-500 truncate">
                      ID: {proj.id}
                    </span>
                    <CardTitle className="text-base font-bold text-neutral-950 dark:text-neutral-50 truncate tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {proj.name}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5 font-mono text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/10 shrink-0"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Listening
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200/40 dark:border-neutral-800/30 mt-3 font-mono text-[10px] font-bold">
                  <div className="flex flex-col p-1.5 rounded-xl bg-rose-500/5 dark:bg-rose-500/2 border border-rose-500/10 text-rose-600 dark:text-rose-400 text-center">
                    <span className="text-xs">{criticalCount}</span>
                    <span className="text-[8px] font-medium uppercase text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Failures
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 rounded-xl bg-amber-500/5 dark:bg-amber-500/2 border border-amber-500/10 text-amber-600 dark:text-amber-400 text-center">
                    <span className="text-xs">{warningCount}</span>
                    <span className="text-[8px] font-medium uppercase text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Warnings
                    </span>
                  </div>
                  <div className="flex flex-col p-1.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/2 border border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center">
                    <span className="text-xs">{infoCount}</span>
                    <span className="text-[8px] font-medium uppercase text-neutral-400 dark:text-neutral-500 mt-0.5">
                      Healthy
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="p-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/30 dark:bg-neutral-900/10 flex flex-col gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200/80 dark:border-neutral-800 w-[68%] group/key relative overflow-hidden">
                    <div className="flex items-center gap-2 overflow-hidden max-w-[85%]">
                      <Key className="h-3.5 w-3.5 text-neutral-400 shrink-0 group-hover/key:text-indigo-500 dark:group-hover/key:text-indigo-400 transition-colors" />
                      <span className="font-mono text-[10px] text-neutral-600 dark:text-neutral-400 truncate tracking-wider">
                        {proj.keyPreview || 'ls_live_••••••••••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(proj.id, 'key-copy')}
                      className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      {copiedId === 'key-copy' ? (
                        <Check className="h-3 w-3 text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-0.5 shrink-0">
                    <button
                      onClick={() => handleRegenerateApiKey(proj.id)}
                      className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-all cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      title="Regenerate Credentials"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setProjectToDelete(proj);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      title="Decommission Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  href={`/projects/${proj.id}/logs`}
                  className="w-full inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-600/10 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-500/10 font-mono text-[11px] font-bold transition-all duration-200 cursor-pointer group shadow-sm"
                >
                  <span>Open Historical Ledger</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 3. Integration Console with Responsive Theming */}
      <Card className="border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Cpu className="h-4 w-4" />
              </div>
              Universal Telemetry Core Integration
            </h2>
            <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
              LogStream-Ops accepts payloads via cross-platform runtime pipelines. Select your core
              network architecture environment stack below.
            </p>
          </div>

          {/* Custom Dropdown UI */}
          <div className="relative self-start md:self-auto min-w-60">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full inline-flex h-10 items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 text-xs font-semibold font-mono text-neutral-800 shadow-sm transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900 text-left select-none"
            >
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-indigo-500" />
                <span>{currentSelectionDetails?.label}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-full origin-top-right rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 z-40 max-h-75 overflow-y-auto telemetry-scrollbar">
                  {FRAMEWORK_OPTIONS.map((framework) => (
                    <button
                      key={framework.id}
                      onClick={() => {
                        setSelectedFramework(framework.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left font-mono px-3 py-2 text-[11px] rounded-lg flex flex-col transition-colors cursor-pointer ${
                        selectedFramework === framework.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <span>{framework.label}</span>
                      <span className="text-[9px] font-medium opacity-60 mt-0.5 font-sans">
                        {framework.runtime}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 divide-y xl:divide-y-0 xl:divide-x divide-neutral-100 dark:divide-neutral-800">
          {/* Side Info Layer */}
          <div className="p-6 xl:col-span-2 space-y-5 flex flex-col justify-between bg-white dark:bg-transparent">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-5 rounded-md bg-indigo-600/10 flex items-center justify-center text-[10px] font-mono font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-500/10">
                  SDK
                </span>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider font-mono">
                  Runtime Hook Strategy
                </h4>
              </div>

              <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
                This blueprint implements non-blocking, clean telemetry forwarding logic inside{' '}
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {currentSelectionDetails?.label}
                </span>{' '}
                setups. It safely intercepts active system transactions, catches critical runtime
                breaks instantly, and offloads network transmission context without blocking main
                event-loop loops.
              </p>
            </div>

            {/* Gateway Resolution Box */}
            <div className="flex items-start gap-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-800 p-3.5 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              <Globe className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 overflow-hidden w-full">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block text-[10px] uppercase font-mono tracking-wider">
                  Workspace Destination Address:
                </span>
                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 break-all select-all block font-medium">
                  {INGESTION_API_URL}
                </span>
              </div>
            </div>
          </div>

          {/* Premium Adaptive Code Studio Screen */}
          <div className="p-6 xl:col-span-3 space-y-2 relative group min-h-110 bg-neutral-50/80 dark:bg-neutral-950/60 backdrop-blur-sm border-t xl:border-t-0 xl:border-l border-neutral-100 dark:border-neutral-800/40">
            {/* Theme Aware Copy Button */}
            <button
              onClick={() => handleCopy(getCleanCodeOutput(), 'active-code-snippet')}
              className="absolute right-4 top-4 z-20 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 cursor-pointer shadow-md hover:scale-105 active:scale-95"
              title="Copy Sequence Code"
            >
              {copiedId === 'active-code-snippet' ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>

            {/* Adaptive Scrolling Code Body */}
            <div className="h-97.5 overflow-y-auto telemetry-scrollbar text-neutral-800 dark:text-neutral-300 font-mono text-[11px] selection:bg-indigo-500/30 selection:text-neutral-900 dark:selection:text-white leading-relaxed whitespace-pre font-medium antialiased">
              {getCleanCodeOutput()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
