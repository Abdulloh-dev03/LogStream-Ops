import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../utils/errors.js';
import { IngestLogInput } from '@logstream/shared';
import { hashApiKey, timingSafeMatch } from '../utils/crypto.js';

/**
 * Log Service
 * Handles ingestion and processing of incoming telemetry logs.
 */
export class LogService {
  /**
   * Processes an incoming log by validating the API key and creating a database record.
   * @param data Validated log ingestion payload.
   * @throws NotFoundError if the project apiKey is invalid.
   */
  static async ingestIncomingLog(data: IngestLogInput) {
    const { apiKey, ...logData } = data;

    // 1. Hash the incoming key and look up directly via the unique index.
    const incomingHash = hashApiKey(apiKey);
    const project = await prisma.project.findUnique({
      where: { hashedApiKey: incomingHash },
      select: { id: true, hashedApiKey: true },
    });

    // 2. Verify with timing-safe comparison as defense-in-depth.
    if (!project || !timingSafeMatch(apiKey, project.hashedApiKey)) {
      throw new NotFoundError('Invalid API Key');
    }

    const projectId = project.id;

    // 3. Create the log record associated with the project
    const log = await prisma.log.create({
      data: {
        projectId,
        message: logData.message,
        stackTrace: logData.stackTrace || null,
        level: logData.level,
        url: logData.url,
        browser: logData.browser || null,
        os: logData.os || null,
      },
    });

    // 4. Update lastUsedAt timestamp on the project
    await prisma.project.update({
      where: { id: projectId },
      data: { lastUsedAt: new Date() },
    });

    return log;
  }
}
