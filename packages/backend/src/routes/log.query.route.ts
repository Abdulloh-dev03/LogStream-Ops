import { Router } from 'express';
import { LogQueryController } from '../controllers/log.query.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * Log Query Routes
 * Path: /dashboard/logs (configured in app.ts)
 */

// All dashboard query routes require authentication
router.use(authMiddleware);

router.get('/all', LogQueryController.getAllLogsForUser);
router.get('/project/:projectId', LogQueryController.getLogsForProject);
router.patch('/:logId/resolve', LogQueryController.resolveLog);

export default router;
