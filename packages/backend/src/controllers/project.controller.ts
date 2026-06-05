import { Request, Response, NextFunction } from 'express';
import { CreateProjectSchema } from '@logstream/shared';
import { ProjectService } from '#src/services/project.service';
import { BadRequestError } from '#src/utils/errors';

/**
 * Project Controller
 * Manages HTTP-level concerns for project operations.
 */
export class ProjectController {
  /**
   * Create a new project
   */
  static async createProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const result = CreateProjectSchema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestError(
          'Validation failed: ' + result.error.issues.map((e) => e.message).join(', '),
        );
      }

      const userId = req.user!.id; // Populated by authMiddleware
      const project = await ProjectService.createProject(userId, result.data.name);

      return res.status(201).json(project);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get all projects for the logged-in user
   */
  static async getAllProjects(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const projects = await ProjectService.getProjectsByUser(userId);

      return res.status(200).json(projects);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete a specific project
   */
  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;

      await ProjectService.deleteProject(userId, projectId);

      return res.status(200).json({
        message: 'Project deleted successfully',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Regenerate (rotate) the API key for a project.
   * Returns the new raw key once — it will not be shown again.
   */
  static async regenerateApiKey(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user!.id;
      const projectId = req.params.id as string;
      const project = await ProjectService.regenerateApiKey(userId, projectId);
      return res.status(200).json(project);
    } catch (error) {
      return next(error);
    }
  }
}
