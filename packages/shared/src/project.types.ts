import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters long.'),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export interface Project {
  id: string;
  name: string;
  // apiKey is only returned once upon creation/rotation; not stored in DB
  apiKey?: string;
  hashedApiKey?: string;
  keyPreview: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string | null;
}
