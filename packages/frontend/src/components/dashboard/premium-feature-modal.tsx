import React from "react"
import { Sparkles, ShieldAlert, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

interface PremiumFeatureModalProps {
  isOpen: boolean
  onClose: () => void
  feature: "project" | "ai" | null
}

export function PremiumFeatureModal({ isOpen, onClose, feature }: PremiumFeatureModalProps) {
  const router = useRouter()
  
  if (!feature) return null

  const isAi = feature === "ai"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
            {isAi ? (
              <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {isAi ? "Unlock AI Root-Cause Analysis" : "Manage Unlimited Projects"}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isAi
              ? "You've discovered a premium feature! Create a free account to instantly diagnose streaming anomalies and predict outages with our machine learning engine."
              : "Demo mode is restricted to the Sandbox Environment. Create a free account to add real telemetry ingestion nodes and manage live microservices."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm">
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Free Tier Includes:</h4>
            <ul className="list-disc list-inside text-neutral-500 space-y-1">
              <li>Up to 3 Active Projects</li>
              <li>10,000 Live Logs per day</li>
              <li>Basic anomaly detection</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-800 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          >
            Continue Exploring
          </button>
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
