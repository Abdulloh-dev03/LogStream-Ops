import { Request, Response, NextFunction } from 'express';
import { IngestLogSchema } from '@logstream/shared';
import { LogService } from '#src/services/log.service';
import { BadRequestError } from '#src/utils/errors';
import logger from '#src/config/logger';

/**
 * Log Controller
 * Manages HTTP-level ingestion logic for telemetry data.
 */
export class LogController {
  /**
   * Public endpoint for ingesting logs from remote client applications.
   */
  static async ingestLog(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // 1. Validate payload using Shared Schema
      const result = IngestLogSchema.safeParse(req.body);

      if (!result.success) {
        throw new BadRequestError(
          'Validation failed: ' + result.error.issues.map((e) => e.message).join(', '),
        );
      }

      // 2. Delegate ingestion to the service layer
      const newLog = await LogService.ingestIncomingLog(result.data);

      // 3. Broadcast to Socket.io room if io is available
      const io = req.app.get('io');
      if (io) {
        const room = `project_${newLog.projectId}`;
        logger.info(`[Socket] Emitting 'new_log' for log ${newLog.id} to room ${room}`);
        io.to(room).emit('new_log', newLog);
      } else {
        logger.warn('[Socket] IO instance not found on app, cannot broadcast log');
      }
      return res.status(201).json({
        message: 'Log ingested successfully',
        log: newLog,
      });
    } catch (error) {
      // 5. Global error handler middleware manages standard exceptions
      return next(error);
    }
  }
}
