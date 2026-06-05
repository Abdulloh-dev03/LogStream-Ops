import { api } from '../api';
import { Log } from '@logstream/shared';
import { io } from 'socket.io-client';

/**
 * Dashboard Log Query API
 *
 * Backend route: /api/dashboard/logs
 */
export const logQueryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Get all logs for a given project with real-time streaming */
    getProjectLogs: builder.query<{ logs: Log[]; totalCount: number }, { projectId: string; page?: number; limit?: number; level?: string; resolved?: boolean }>({
      query: ({ projectId, ...params }) => ({
        url: `/dashboard/logs/project/${projectId}`,
        params,
      }),
      providesTags: (result, _error, { projectId }) =>
        result
          ? [
              ...result.logs.map(({ id }) => ({ type: 'Logs' as const, id })),
              { type: 'Logs', id: `LIST_${projectId}` },
            ]
          : [{ type: 'Logs', id: `LIST_${projectId}` }],
      
      async onCacheEntryAdded(
        { projectId },
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        // Fix: Use only the origin to avoid "Invalid namespace" error if URL has a path (like /api)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        let socketUrl = baseUrl;

        try {
          const url = new URL(baseUrl);
          socketUrl = url.origin;
        } catch {
          // Fallback if baseUrl is relative or invalid
          if (!baseUrl.startsWith('http')) {
            socketUrl = window.location.origin;
          }
        }

        const socket = io(socketUrl, {
          query: { projectId },
          withCredentials: true,
          transports: ['websocket', 'polling'], 
        });

        try {
          await cacheDataLoaded;

          // Handle new log ingested
          socket.on('new_log', (newLog: Log) => {
            updateCachedData((draft) => {
              // Prepend new log to the list
              if (draft && draft.logs) {
                draft.logs.unshift(newLog);
                draft.totalCount += 1;
              }
            });
          });

          // Handle log resolved by another client
          socket.on('log_resolved', (updatedLog: Log) => {
            updateCachedData((draft) => {
              if (draft && draft.logs) {
                const index = draft.logs.findIndex((l) => l.id === updatedLog.id);
                if (index !== -1) {
                  draft.logs[index] = updatedLog;
                }
              }
            });
          });
        } catch {
          // no-op
        }

        await cacheEntryRemoved;
        socket.close();
      },

    }),

    /** Get all logs across all user projects */
    getAllLogs: builder.query<{ logs: Log[]; totalCount: number }, { page?: number; limit?: number; level?: string; resolved?: boolean } | void>({
      query: (params) => ({
        url: '/dashboard/logs/all',
        params: params || {},
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.logs.map(({ id }) => ({ type: 'Logs' as const, id })),
              { type: 'Logs', id: 'LIST_ALL' },
            ]
          : [{ type: 'Logs', id: 'LIST_ALL' }],
    }),

    /** Resolve a specific log entry */
    resolveLog: builder.mutation<Log, { logId: string; resolved: boolean }>({
      query: ({ logId, resolved }) => ({
        url: `/dashboard/logs/${logId}/resolve`,
        method: 'PATCH',
        body: { resolved },
      }),
      invalidatesTags: (result) => (result ? [{ type: 'Logs', id: result.id }] : []),
    }),
  }),
  overrideExisting: true,
});

export const { useGetProjectLogsQuery, useGetAllLogsQuery, useResolveLogMutation } = logQueryApi;
