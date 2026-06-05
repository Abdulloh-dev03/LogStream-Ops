import { api } from '../api';
import { IngestLogInput } from '@logstream/shared';

/**
 * Log Ingestion API – public endpoint (rate‑limited).
 * Backend route: POST /api/ingest (see backend/src/routes/log.route.ts)
 */
export const ingestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    ingestLog: builder.mutation<{ success: boolean }, IngestLogInput>({
      query: (body) => ({
        url: '/ingest',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useIngestLogMutation } = ingestApi;
