import { Router } from 'express';
import { LogController } from '#src/controllers/log.controller.js';
import { ingestRateLimiter } from '#src/middleware/rateLimiter.js';

const router = Router();

/**
 * Log Ingestion Routes
 * Path: /ingest (configured in app.ts)
 * 
 * This endpoint is public as it receives logs from various client applications.
 * Rate limiting is applied to prevent abuse and manage traffic spikes.
 */
router.post('/', ingestRateLimiter, LogController.ingestLog);

export default router;
