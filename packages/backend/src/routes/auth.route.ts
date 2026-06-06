import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Authentication Routes
 * Path: /auth (configured in app.ts)
 */

// Public routes
router.post('/sign-up', authRateLimiter, AuthController.signUp);
router.post('/sign-in', authRateLimiter, AuthController.signIn);
router.post('/sign-out', AuthController.signOut);

// Protected routes
router.get('/me', authMiddleware, AuthController.getProfile);

export default router;
