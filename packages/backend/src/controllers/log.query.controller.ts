import { Request, Response, NextFunction } from 'express';
import { LogQueryService } from '#src/services/log.query.service';
import { LogLevel } from '@prisma/client';

/**
 * Log Query Controller
 * Manages HTTP-level logic for querying dashboard logs.
 */
export class LogQueryController {
  /**
   * Retrieves logs for a specific project with pagination and filtering.
   */
  static async getLogsForProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { projectId } = req.params;
      const userId = req.user!.id;

      // Parse and sanitize query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const level = req.query.level as LogLevel | undefined;
      
      let resolved: boolean | undefined;
      if (req.query.resolved === 'true') {
        resolved = true;
      } else if (req.query.resolved === 'false') {
        resolved = false;
      }

      // Delegate to service layer
      const result = await LogQueryService.getProjectLogs(userId, projectId as string, {
        page,
        limit,
        level,
        resolved,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Retrieves logs for all projects of the logged-in user with pagination and filtering.
   */
  static async getAllLogsForUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user!.id;

      // Parse and sanitize query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100;
      const level = req.query.level as LogLevel | undefined;
      
      let resolved: boolean | undefined;
      if (req.query.resolved === 'true') {
        resolved = true;
      } else if (req.query.resolved === 'false') {
        resolved = false;
      }

      // Delegate to service layer
      const result = await LogQueryService.getAllLogs(userId, {
        page,
        limit,
        level,
        resolved,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Updates the resolved status of a specific log entry.
   */
  static async resolveLog(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { logId } = req.params;
      const userId = req.user!.id;
      const { resolved } = req.body;

      if (typeof resolved !== 'boolean') {
        return res.status(400).json({ message: 'Resolved status must be a boolean' });
      }

      const updatedLog = await LogQueryService.resolveLog(userId, logId as string, resolved);

      // Notify clients about the resolution
      const io = req.app.get('io');
      if (io) {
        io.to(`project_${updatedLog.projectId}`).emit('log_resolved', updatedLog);
      }

      return res.status(200).json(updatedLog);
    } catch (error) {
      return next(error);
    }
  }
}
