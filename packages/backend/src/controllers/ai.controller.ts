import { Request, Response, NextFunction } from 'express';
import { AiService } from '#src/services/ai.service.js';
import { prisma } from '#src/lib/prisma';
import { ForbiddenError, NotFoundError } from '#src/utils/errors';

/**
 * AI Controller
 * Manages HTTP-level logic for AI-powered log analysis.
 */
export class AiController {
  /**
   * Triggers or retrieves an AI-generated analysis for a specific log entry.
   */
  static async getLogAnalysis(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { logId } = req.params;
      const userId = req.user!.id; // Populated by authMiddleware

      const analysis = await AiService.initiateAnalysis(userId, logId as string);

      return res.status(200).json(analysis);
    } catch (error) {
      return next(error);
    }
  }
  static getAnalysisStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { logId } = req.params;
      const logIdStr = Array.isArray(logId) ? logId[0] : logId;
      const userId = req.user?.id;
      if (!userId) {
        throw new ForbiddenError('User not authenticated');
      }

      // Fetch the analysis and verify project ownership via the log relation
      const analysis = await prisma.aiAnalysis.findUnique({
        where: { logId: logIdStr },
        include: {
          log: {
            include: { project: true }
          }
        }
      });

      if (!analysis) {
        throw new NotFoundError('Analysis not found for this log.');
      }

      // Enforce Tenant Isolation Security
      if ((analysis as any).log.project.userId !== userId) {
        throw new ForbiddenError('You do not have permission to view this analysis.');
      }

      // Strip the log relation out before sending so the JSON stays clean
      const { log, ...cleanAnalysis } = analysis as any;

      return res.status(200).json(cleanAnalysis);
    } catch (error) {
      return next(error);
    }
  }
}