import { z } from 'zod';

/**
 * Zod validation schema for incoming log ingestion requests.
 */
export const IngestLogSchema = z.object({
  apiKey: z
    .string()
    .startsWith('ls_live_', { message: 'API Key must start with "ls_live_"' }),
  message: z.string().min(1, 'Message is required'),
  stackTrace: z.string().optional(),
  level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).default('ERROR'),
  url: z.string().url('A valid URL is required'),
  browser: z.string().optional().nullable(),
  os: z.string().optional().nullable(),
});

/**
 * Inferred TypeScript type for Log Ingestion Input.
 */
export type IngestLogInput = z.infer<typeof IngestLogSchema>;

export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface Log {
  id: string;
  projectId: string;
  message: string;
  stackTrace: string | null;
  level: LogLevel;
  url: string;
  browser: string | null;
  os: string | null;
  resolved: boolean;
  createdAt: string;
}

export type AnalysisStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AiAnalysis {
  id: string;
  logId: string;
  status: AnalysisStatus;
  explanation: string | null;
  suggestedFix: string | null;
  errorReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Simple shape used by the frontend when we only care about the
 * explanation and suggested fix – mirrors what the UI expects.
 */
export interface AiAnalysisResult {
  /** Human‑readable root‑cause description */
  rootCause: string;
  /** Suggested code patch or remediation */
  suggestedFix: string;
}
