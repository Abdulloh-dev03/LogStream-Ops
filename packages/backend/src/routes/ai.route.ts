import { Router } from 'express';
import { AiController } from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * AI Analysis Routes
 * Path: /ai (configured in app.ts)
 */

// All AI analysis routes are protected by authentication
router.use(authMiddleware);

/**
 * @route POST /api/ai/log/:logId/analyze
 * @desc  Triggers AI analysis for a specific log entry
 */
router.post('/log/:logId/analyze', aiRateLimiter, AiController.getLogAnalysis);
router.get('/log/:logId/status', AiController.getAnalysisStatus);

export default router;
