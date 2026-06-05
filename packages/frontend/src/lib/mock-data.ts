import { Log, LogLevel, AiAnalysis } from "@logstream/shared/src/log.types";


export const MOCK_PROJECTS: { id: string; name: string; keyPreview: string }[] = [
  { id: "proj-1", name: "Production API Gateway", keyPreview: "ls_live_••••••••f091" },
  { id: "proj-2", name: "Auth & Identity Provider", keyPreview: "ls_live_••••••••7273" },
  { id: "proj-3", name: "Stripe Billing Webhook", keyPreview: "ls_live_••••••••6364" },
  { id: "proj-4", name: "Next.js Frontend SSR", keyPreview: "ls_live_••••••••5455" },
];

export const MOCK_ENVIRONMENTS = ["production", "staging", "development"] as const;
export type Environment = (typeof MOCK_ENVIRONMENTS)[number];

// Realistic error payloads with stack traces and AI diagnostics
export interface TemplateError {
  message: string;
  level: LogLevel;
  url: string;
  browser: string;
  os: string;
  stackTrace: string;
  explanation: string;
  suggestedFix: string;
}

export const ERROR_TEMPLATES: TemplateError[] = [
  {
    message: "PrismaClientKnownRequestError: Unique constraint failed on the fields: (email)",
    level: "ERROR",
    url: "https://api.logstreamops.com/v1/auth/register",
    browser: "Chrome 122.0.0",
    os: "macOS 14.3.1",
    stackTrace: `PrismaClientKnownRequestError: Unique constraint failed on the fields: (email)
    at t.handleRequestError (/node_modules/@prisma/client/runtime/library.js:122:7232)
    at t.request (/node_modules/@prisma/client/runtime/library.js:122:6840)
    at async AuthController.signUp (/packages/backend/src/controllers/auth.controller.ts:42:26)
    at async Layer.handle [as handle_request] (/node_modules/express/lib/router/layer.js:95:5)`,
    explanation: `### Root Cause Analysis
The server attempted to insert a new user record with an email address that already exists in the PostgreSQL database. The \`User\` table enforces a \`@unique\` constraint on the \`email\` column. 

### Diagnostics
- **Endpoint**: \`POST /v1/auth/register\`
- **Database**: PostgreSQL (Supabase)
- **Constraint**: \`User_email_key\``,
    suggestedFix: `Check if the user exists before running the Prisma \`create\` operation, or wrap it in a \`try-catch\` block to return a clean \`400 Bad Request\` instead of throwing a \`500 Internal Server Error\`.

\`\`\`typescript
// Fix in auth.controller.ts
try {
  const newUser = await prisma.user.create({
    data: { email, password: hashedPassword }
  });
  return res.status(201).json(newUser);
} catch (error) {
  if (error.code === 'P2002') {
    return res.status(400).json({ message: "Email is already registered" });
  }
  throw error;
}
\`\`\``
  },
  {
    message: "Redis Connection Refused: ECONNREFUSED 127.0.0.1:6379",
    level: "CRITICAL",
    url: "https://api.logstreamops.com/v1/projects",
    browser: "Edge 121.0.0",
    os: "Windows 11",
    stackTrace: `Error: connect ECONNREFUSED 127.0.0.1:6379
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16)
    at RedisClient.connect (/node_modules/redis/dist/index.js:522:12)
    at async getRedisClient (/packages/backend/src/lib/redis.ts:12:5)
    at async authRateLimiter (/packages/backend/src/middleware/rateLimiter.ts:25:22)`,
    explanation: `### Root Cause Analysis
The API gateway failed to connect to the local Redis instance on port 6379. Redis is utilized for api rate limiting. Because the database connection was refused, subsequent authentication requests failed instantly, leading to an outage of the registration endpoints.

### Diagnostics
- **Target**: \`127.0.0.1:6379\`
- **Failure Code**: \`ECONNREFUSED\`
- **Service Dependency**: Rate limiter cache`,
    suggestedFix: `Update your environmental configuration to target the managed cluster, and add a connection health check script to keep the gateway running offline using an in-memory memory fallback rate limiter.

\`\`\`diff
# Fix in .env
- REDIS_URL=redis://127.0.0.1:6379
+ REDIS_URL=redis://production-redis-cluster.cache.amazonaws.com:6379
\`\`\``
  },
  {
    message: "StripeSignatureVerificationError: No signatures found matching the expected signature for payload.",
    level: "ERROR",
    url: "https://api.logstreamops.com/v1/billing/webhook",
    browser: "Stripe-Webhook-Agent",
    os: "Linux",
    stackTrace: `StripeSignatureVerificationError: No signatures found matching the expected signature for payload.
    at Stripe.webhooks.constructEvent (/node_modules/stripe/lib/Webhooks.js:82:12)
    at billingWebhookHandler (/packages/backend/src/controllers/billing.controller.ts:18:24)
    at Layer.handle [as handle_request] (/node_modules/express/lib/router/layer.js:95:5)`,
    explanation: `### Root Cause Analysis
Stripe webhook events sent to the billing endpoint failed signature validation. This occurs when the webhook signing secret configured on the server does not match the Stripe dashboard key, or when the request payload is parsed into JSON before verification instead of keeping it as a raw buffer.

### Diagnostics
- **Expected Header**: \`stripe-signature\`
- **Verification Utility**: \`stripe.webhooks.constructEvent\``,
    suggestedFix: `Make sure you parse the Stripe body as a raw buffer (not as parsed JSON) and verify the webhook secret configuration.

\`\`\`typescript
// Fix in server.ts / express config
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
\`\`\``
  },
  {
    message: "React Hydration Mismatch: Text content did not match. Server: '5/27/2026' Client: '5/28/2026'",
    level: "WARNING",
    url: "https://logstreamops.com/dashboard",
    browser: "Safari 17.2",
    os: "iOS 17.2",
    stackTrace: `Error: Text content did not match. Server: "5/27/2026" Client: "5/28/2026"
    at Page (/packages/frontend/src/app/dashboard/page.tsx:84:12)
    at react-dom.development.js:1229:32
    at renderWithHooks (/node_modules/react-dom/cjs/react-dom.development.js:15433:18)
    at mountIndeterminateComponent (/node_modules/react-dom/cjs/react-dom.development.js:18342:13)`,
    explanation: `### Root Cause Analysis
A rendering difference occurred during static site generation or server-side rendering (SSR) compared to client-side hydration. A dynamic Date function (\`new Date().toLocaleDateString()\`) was computed during SSR on the server, but local client time zone rendering returned a different date string on the user's phone.

### Diagnostics
- **Mismatch Parameter**: DateTime format string
- **Hydration Target**: SRE metrics widget`,
    suggestedFix: `Ensure dynamic dates are rendered only after component mounting using a React state effect hook, or suppress the hydration warning if date accuracy matches requirements.

\`\`\`typescript
// Fix in widget component
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

return mounted ? <span>{new Date().toLocaleDateString()}</span> : <span>Loading...</span>;
\`\`\``
  },
  {
    message: "FetchError: Failed to fetch API telemetry data. Connection timeout at 5000ms",
    level: "WARNING",
    url: "https://logstreamops.com/dashboard",
    browser: "Chrome 122.0.0",
    os: "Linux x86_64",
    stackTrace: `FetchError: connect ETIMEDOUT 10.0.2.14:4000
    at ClientRequest.<anonymous> (/packages/frontend/node_modules/node-fetch/index.js:1493:11)
    at ClientRequest.emit (node:events:517:28)
    at Socket.socketErrorListener (node:_http_client:501:9)`,
    explanation: `### Root Cause Analysis
The client application failed to query the API server at address \`10.0.2.14:4000\` within the 5-second deadline. The issue represents a network routing timeout or server overload. The client automatically fallback-loaded cached dashboard widgets.`,
    suggestedFix: `Optimize connection timeouts or deploy an edge-cache service worker. Increment retry counts for network fetching utilities.

\`\`\`typescript
// Add fetch retries
const fetchWithRetry = async (url, options, retries = 3) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) return fetchWithRetry(url, options, retries - 1);
    throw err;
  }
};
\`\`\``
  },
  {
    message: "Database Client Error: Pool connection limits exceeded. Current: 100/100 connections.",
    level: "CRITICAL",
    url: "https://api.logstreamops.com/v1/logs/query",
    browser: "Mozilla 5.0",
    os: "Linux",
    stackTrace: `DatabaseError: Pool connections limit reached.
    at Pool.connect (/node_modules/pg/lib/pool.js:80:12)
    at PrismaClient.execute (/node_modules/@prisma/client/runtime/library.js:52:12)
    at LogQueryController.getLogsForProject (/packages/backend/src/controllers/log.query.controller.ts:8:14)`,
    explanation: `### Root Cause Analysis
The database client connection pool was completely depleted, causing requests to stack up and timeout. This occurs when serverless routes do not share database clients, or connection endpoints are not closed/returned to the pool properly during query errors.`,
    suggestedFix: `Configure connection pooling on Supabase (using PgBouncer) and enforce connection reuse in Next.js/Express Prisma client configs.

\`\`\`typescript
// Fix in client.ts
global.prisma = global.prisma || new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL + "?connection_limit=10" } }
});
\`\`\``
  },
  {
    message: "GET /api/health - HTTP 200 OK (Ping: 4ms)",
    level: "INFO",
    url: "https://api.logstreamops.com/health",
    browser: "Internal-Healthchecker",
    os: "Linux",
    stackTrace: "",
    explanation: `### Transaction Summary
This is a standard health-check ping received by the Kubernetes container load balancer.
No errors found.`,
    suggestedFix: "No fix required."
  },
  {
    message: "Successful authentication for user: admin@logstreamops.com",
    level: "INFO",
    url: "https://api.logstreamops.com/v1/auth/sign-in",
    browser: "Chrome 122.0.0",
    os: "macOS 14.3.1",
    stackTrace: "",
    explanation: "User authorization complete. JWT session cookie assigned.",
    suggestedFix: "No action needed."
  }
];

// Helper to generate simulated historical logs
export function generateInitialLogs(projectId: string, count: number = 50): Log[] {
  const logs: Log[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    // Generate timestamps distributed over the last 24 hours
    const logTime = new Date(now.getTime() - (count - i) * 12 * 60 * 1000 - Math.random() * 5 * 60 * 1000);
    
    // Choose random template
    const template = ERROR_TEMPLATES[Math.floor(Math.random() * ERROR_TEMPLATES.length)];
    
    logs.push({
      id: `log-${projectId}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      message: template.message,
      stackTrace: template.stackTrace || null,
      level: template.level,
      url: template.url,
      browser: template.browser || null,
      os: template.os || null,
      resolved: i % 7 === 0, // Mark some logs resolved
      createdAt: logTime.toISOString(),
    });
  }
  
  // Sort with newest first
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Generate a random single log (for live ingestion simulation)
export function generateRandomLog(projectId: string): Log {
  const template = ERROR_TEMPLATES[Math.floor(Math.random() * ERROR_TEMPLATES.length)];
  return {
    id: `log-live-${Math.random().toString(36).substring(2, 9)}`,
    projectId,
    message: template.message,
    stackTrace: template.stackTrace || null,
    level: template.level,
    url: template.url,
    browser: template.browser || null,
    os: template.os || null,
    resolved: false,
    createdAt: new Date().toISOString(),
  };
}

// Get pre-baked AI analysis report for a log
export function getSimulatedAiAnalysis(log: Log): AiAnalysis {
  const matchingTemplate = ERROR_TEMPLATES.find(t => t.message === log.message) || ERROR_TEMPLATES[0];
  
  return {
    id: `ai-analysis-${log.id}`,
    logId: log.id,
    status: "COMPLETED",
    explanation: matchingTemplate.explanation,
    suggestedFix: matchingTemplate.suggestedFix,
    errorReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
