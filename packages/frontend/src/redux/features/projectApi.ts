import { api } from '../api';
import { Project, CreateProjectInput, Project as ProjectType } from '@logstream/shared';

/**
 * Project Management API
 *
 * Backend routes (see backend/src/routes/project.route.ts):
 *   POST   /api/projects                    -> create a project
 *   GET    /api/projects                    -> list all projects for the logged‑in user
 *   DELETE /api/projects/:id                -> delete a project
 *   POST   /api/projects/:id/regenerate-key -> rotate the API key
 */
export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Create a new project */
    createProject: builder.mutation<Project, CreateProjectInput>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),

    /** Get all projects for the current user */
    getProjects: builder.query<Project[], void>({
      query: () => '/projects',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Projects' as const, id })),
              { type: 'Projects', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),

    /** Delete a project */
    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),

    /** Regenerate (rotate) a project's API key */
    regenerateApiKey: builder.mutation<Project, string>({
      query: (id) => ({
        url: `/projects/${id}/regenerate-key`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Projects', id }],
    }),

    /** (Optional) Update a project – defined for future use */
    updateProject: builder.mutation<Project, { id: string; data: Partial<CreateProjectInput> }>({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Projects', id }],
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useRegenerateApiKeyMutation,
  useUpdateProjectMutation,
} = projectApi;
