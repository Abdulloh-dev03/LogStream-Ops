import { prisma } from '../lib/prisma.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import logger from '../config/logger.js';
import {
  generateSecureApiKey,
  hashApiKey,
  generateKeyPreview,
} from '../utils/crypto.js';

/**
 * Project Service
 * Handles business logic for project management.
 */
export class ProjectService {
  /**
   * Creates a new project linked to the authenticated user.
   * Returns the created project with a one‑time raw API key.
   */
  static async createProject(userId: string, name: string) {
    const apiKey = generateSecureApiKey();
    const hashedApiKey = hashApiKey(apiKey);
    const keyPreview = generateKeyPreview(apiKey);

    const project = await prisma.project.create({
      data: {
        name,
        userId,
        hashedApiKey,
        keyPreview,
      },
    });

    logger.info(`Project created: ${project.id} for user ${userId}`);
    // Return the raw key only once; do not store it.
    return { ...project, apiKey } as any;
  }

  /**
   * Regenerates an API key for a project (rotation).
   */
  static async regenerateApiKey(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== userId) {
      logger.warn(`Unauthorized key rotation: User ${userId} on project ${projectId}`);
      throw new ForbiddenError('You do not have permission to rotate this key');
    }

    const newApiKey = generateSecureApiKey();
    const hashedApiKey = hashApiKey(newApiKey);
    const keyPreview = generateKeyPreview(newApiKey);

    await prisma.project.update({
      where: { id: projectId },
      data: { hashedApiKey, keyPreview, lastUsedAt: null },
    });

    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
    });
    return { ...updatedProject, apiKey: newApiKey } as any;
  }

  /**
   * Fetches all projects belonging to the logged-in user.
   */
  static async getProjectsByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a specific project if it belongs to the user.
   */
  static async deleteProject(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundError('Project not found');
    if (project.userId !== userId) {
      logger.warn(`Unauthorized deletion attempt: User ${userId} tried to delete project ${projectId}`);
      throw new ForbiddenError('You do not have permission to delete this project');
    }
    await prisma.project.delete({ where: { id: projectId } });
    logger.info(`Project deleted: ${projectId}`);
    return { success: true };
  }
}
