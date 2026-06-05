'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Settings,
  Bell,
  Palette,
  User,
  Shield,
  Check,
  Save,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { densityMode, setDensityMode, isStreaming, setIsStreaming, user, isAuthenticated } =
    useDashboard();

  // Form states
  const [profileName, setProfileName] = useState(
    isAuthenticated ? `${user?.firstname || ''} ${user?.lastname || ''}`.trim() : 'Guest User',
  );
  const [slackWebhook, setSlackWebhook] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(
    isAuthenticated ? user?.email || 'guest@logstreamops.com' : 'guest@logstreamops.com',
  );
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully');
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-500" />
          Workspace Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure telemetry streaming, UI layouts, user profile information, and notification
          webhooks.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: UI & Workspace Preferences */}
          <div className="rounded-xl border border-neutral-200/50 bg-white p-5 dark:border-neutral-800/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <Palette className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100">
                Workspace Preferences
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Density setting */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Layout Density
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-950 p-1 rounded border border-neutral-200/50 dark:border-neutral-850">
                  <button
                    type="button"
                    onClick={() => setDensityMode('comfortable')}
                    className={`rounded py-1.5 font-mono text-[10px] transition-all cursor-pointer ${
                      densityMode === 'comfortable'
                        ? 'bg-white text-neutral-900 shadow dark:bg-neutral-800 dark:text-neutral-100 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                    }`}
                  >
                    Comfortable
                  </button>
                  <button
                    type="button"
                    onClick={() => setDensityMode('compact')}
                    className={`rounded py-1.5 font-mono text-[10px] transition-all cursor-pointer ${
                      densityMode === 'compact'
                        ? 'bg-white text-neutral-900 shadow dark:bg-neutral-800 dark:text-neutral-100 font-semibold'
                        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>

              {/* Streaming state */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold block">Auto WebSocket Stream</span>
                  <span className="text-[9px] text-neutral-400 block mt-0.5">
                    Stream live telemetry simulated logs at intervals.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStreaming(!isStreaming)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out outline-none ${
                    isStreaming ? 'bg-indigo-500' : 'bg-neutral-200 dark:bg-neutral-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-250 ease-in-out ${
                      isStreaming ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Account Profile */}
          <div className="rounded-xl border border-neutral-200/50 bg-white p-5 dark:border-neutral-800/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <User className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100">
                User Credentials
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded py-1.5 px-3 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Email Identity
                </label>
                <input
                  type="email"
                  disabled
                  value={isAuthenticated ? user?.email || '' : 'guest@logstreamops.com'}
                  className="w-full bg-neutral-100 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-850 rounded py-1.5 px-3 outline-none opacity-60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Incident Notifications */}
          <div className="rounded-xl border border-neutral-200/50 bg-white p-5 dark:border-neutral-800/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <Bell className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-850 dark:text-neutral-100">
                Diagnostic Webhooks
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Slack Alert Channel Webhook
                </label>
                <input
                  type="text"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded py-1.5 px-3 outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[10px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email Report Recipients
                </label>
                <input
                  type="text"
                  value={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded py-1.5 px-3 outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[10px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form controls */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-5 font-mono text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Save Workspace Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
