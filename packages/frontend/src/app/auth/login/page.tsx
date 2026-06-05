"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { 
  AuthInput, 
  PasswordInput, 
  AuthButton} from "@/components/auth/auth-form-fields"
import { useSignInMutation } from "@/redux/features/authApi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
export default function LoginPage() {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [signin, {isLoading}] = useSignInMutation();
  const router = useRouter();
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setError("");

    try {
      await signin({email, password}).unwrap();
      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.data?.message || "Failed to sign in. Please try again.");
    }
  }
  return (
    <AuthLayout 
      title="Welcome back" 
      description="Enter your credentials to access your telemetry dashboard"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput 
            label="Work Email" 
            type="email" 
            placeholder="name@company.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            icon={<Mail className="h-5 w-5" />}
          />

          <div className="space-y-1">
            <PasswordInput 
              label="Password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              icon={<Lock className="h-4 w-4" />}
            />
          </div>

          <AuthButton loading={isLoading} type="submit" className="cursor-pointer">
            Sign In to Console
          </AuthButton>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link 
            href="/auth/register" 
            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-indigo-500 transition-colors cursor-pointer"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
