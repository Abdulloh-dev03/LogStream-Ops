import { Router } from 'express';
import { ProjectController } from '#src/controllers/project.controller';
import { authMiddleware } from '#src/middleware/auth';

const router = Router();

/**
 * Project Management Routes
 * Path: /projects (configured in app.ts)
 */

// All routes are protected via authMiddleware
router.use(authMiddleware);

router.post('/', ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.delete('/:id', ProjectController.deleteProject);
router.post('/:id/regenerate-key', ProjectController.regenerateApiKey);

export default router;
