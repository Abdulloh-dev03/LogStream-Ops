"use client"

import React, { useState, forwardRef } from "react"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Base Input ────────────────────────────────────────────────────────────────

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  success?: boolean
  icon?: React.ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, success, icon, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 font-mono text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-150",
              "dark:bg-neutral-900/50 dark:text-neutral-100 dark:placeholder-neutral-600",
              "focus:ring-2 focus:ring-offset-0",
              icon ? "pl-9" : "",
              error
                ? "border-rose-400/70 focus:border-rose-400 focus:ring-rose-500/20 dark:border-rose-500/40 dark:focus:border-rose-400/70"
                : success
                ? "border-emerald-400/70 focus:border-emerald-400 focus:ring-emerald-500/20 dark:border-emerald-500/40"
                : "border-neutral-200/80 focus:border-neutral-400 focus:ring-neutral-200 dark:border-neutral-700/60 dark:focus:border-neutral-500 dark:focus:ring-neutral-700/40",
              className
            )}
            {...props}
          />
          {(error || success) && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle className="h-4 w-4 text-rose-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500 dark:text-rose-400">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{hint}</p>
        )}
      </div>
    )
  }
)
AuthInput.displayName = "AuthInput"

// ─── Password Input ────────────────────────────────────────────────────────────

interface PasswordInputProps extends Omit<AuthInputProps, "type"> {}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <div className="relative">
        <AuthInput ref={ref} type={visible ? "text" : "password"} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-9.5 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

// ─── Auth Submit Button ────────────────────────────────────────────────────────

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export function AuthButton({ loading, children, disabled, className, ...props }: AuthButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg bg-neutral-950 px-4 py-2.5 font-mono text-sm font-semibold text-white outline-none transition-all duration-150",
        "dark:bg-white dark:text-neutral-950",
        "hover:bg-neutral-800 dark:hover:bg-neutral-100",
        "focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}

// ─── Password Strength Meter ───────────────────────────────────────────────────

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter((c) => c.valid).length

  const strengthLabel =
    score === 0 ? "" : score === 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong"
  const strengthColor =
    score === 0
      ? "bg-neutral-200 dark:bg-neutral-700"
      : score === 1
      ? "bg-rose-500"
      : score === 2
      ? "bg-amber-500"
      : score === 3
      ? "bg-blue-500"
      : "bg-emerald-500"

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-all duration-300",
                i <= score ? strengthColor : "bg-neutral-200 dark:bg-neutral-700"
              )}
            />
          ))}
        </div>
        {strengthLabel && (
          <span
            className={cn(
              "font-mono text-[10px] font-semibold",
              score === 1 ? "text-rose-500" :
              score === 2 ? "text-amber-500" :
              score === 3 ? "text-blue-500" : "text-emerald-500"
            )}
          >
            {strengthLabel}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((c) => (
          <span
            key={c.label}
            className={cn(
              "flex items-center gap-1 font-mono text-[10px] transition-colors",
              c.valid ? "text-emerald-500" : "text-neutral-400 dark:text-neutral-500"
            )}
          >
            <span className={cn("h-1 w-1 rounded-full", c.valid ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600")} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Auth Divider ──────────────────────────────────────────────────────────────

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
    </div>
  )
}

// ─── Social Auth Button ────────────────────────────────────────────────────────

interface SocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: "github" | "google"
  children: React.ReactNode
}

export function SocialButton({ provider, children, className, ...props }: SocialButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-lg border border-neutral-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-neutral-700 outline-none transition-all duration-150",
        "dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-300",
        "hover:bg-neutral-50 hover:border-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:border-neutral-700",
        "focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
        "active:scale-[0.99]",
        className
      )}
      {...props}
    >
      {provider === "github" && (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      )}
      {provider === "google" && (
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {children}
    </button>
  )
}
