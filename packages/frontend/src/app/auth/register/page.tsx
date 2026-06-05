"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react"
import { AuthLayout } from "@/components/auth/auth-layout"
import { 
  AuthInput, 
  PasswordInput, 
  AuthButton, 
  PasswordStrength 
} from "@/components/auth/auth-form-fields"
import { useSignUpMutation } from "@/redux/features/authApi"
import { toast } from "sonner";
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("")
  const [error, setError] = useState("");
  const [signup, {isLoading}] = useSignUpMutation();
  const router = useRouter();
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signup({firstname,lastname,email,password}).unwrap();
      toast.success(
        "Account created successfully!"
      );
    router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.data?.message || "Failed to create account. Please try again.",
      );
    }
  }

  return (
    <AuthLayout 
      title="Create organization" 
      description="Start monitoring your infrastructure with AI-driven insights"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <AuthInput 
              label="First Name" 
              placeholder="John" 
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required 
            />
            <AuthInput 
              label="Last Name" 
              placeholder="Doe" 
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required 
            />
          </div>

          <AuthInput 
            label="Work Email" 
            type="email" 
            placeholder="name@company.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
          />

          <div className="space-y-3">
            <PasswordInput 
              label="Password" 
              placeholder="••••••••"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength password={password} />
          </div>

          <div className="rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/30 dark:bg-neutral-900/30 p-3">
            <div className="flex gap-3">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                By creating an account, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>

          <AuthButton loading={isLoading} type="submit" className="group cursor-pointer">
            <span className="flex items-center justify-center gap-2">
              Create Account
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </AuthButton>
        </form>

        <p className="text-center text-xs text-neutral-500">
          Already have an account?{" "}
          <Link 
            href="/auth/login" 
            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
