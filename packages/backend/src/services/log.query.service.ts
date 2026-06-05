import { prisma } from '#src/lib/prisma.js';
import { ForbiddenError, NotFoundError } from '#src/utils/errors.js';
import { LogLevel } from '@prisma/client';

export interface LogQueryFilters {
  page: number;
  limit: number;
  level?: LogLevel;
  resolved?: boolean;
}

/**
 * Log Query Service
 * Handles paginated and filtered log retrieval with strict tenant isolation.
 */
export class LogQueryService {
  /**
   * Fetches logs for a specific project after verifying ownership.
   */
  static async getProjectLogs(userId: string, projectId: string, filters: LogQueryFilters) {
    const { page, limit, level, resolved } = filters;

    // Step 1: Tenant Isolation Security - Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    if (project.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access logs for this project.');
    }

    // Step 2: Build dynamic where clause
    const where: any = {
      projectId,
    };

    if (level) {
      where.level = level;
    }

    if (resolved !== undefined) {
      where.resolved = resolved;
    }

    // Step 3: Query logs with pagination and sorting
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.log.count({ where }),
    ]);

    // Step 4: Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return {
      logs,
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Fetches logs across all projects owned by the user.
   */
  static async getAllLogs(userId: string, filters: LogQueryFilters) {
    const { page, limit, level, resolved } = filters;

    // Build dynamic where clause for all projects of this user
    const where: any = {
      project: {
        userId,
      },
    };

    if (level) {
      where.level = level;
    }

    if (resolved !== undefined) {
      where.resolved = resolved;
    }

    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.log.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.log.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      logs,
      totalCount,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Updates the resolved status of a log after verifying project ownership.
   */
  static async resolveLog(userId: string, logId: string, resolved: boolean) {
    // 1. Fetch log and its project ownership info in one go
    const log = await prisma.log.findUnique({
      where: { id: logId },
      include: {
        project: {
          select: { userId: true },
        },
      },
    });

    if (!log) {
      throw new NotFoundError('Log entry not found.');
    }

    // 2. Tenant Isolation Check
    if (log.project.userId !== userId) {
      throw new ForbiddenError('You do not have permission to modify this log entry.');
    }

    // 3. Update the log
    const updatedLog = await prisma.log.update({
      where: { id: logId },
      data: { resolved },
    });

    return updatedLog;
  }
}
