import { api } from '../api';
import { AiAnalysis } from '@logstream/shared/src/log.types';

/**
 * AI Analysis API
 *
 * Backend routes (see backend/src/routes/ai.route.ts):
 *   POST /api/ai/log/:logId/analyze  -> start analysis (returns AiAnalysis object)
 *   GET  /api/ai/log/:logId/status   -> poll for result
 */
export const aiApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Trigger AI analysis for a specific log entry */
    triggerAnalysis: builder.mutation<AiAnalysis, { logId: string }>({
      query: ({ logId }) => ({
        url: `/ai/log/${logId}/analyze`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { logId }) => [{ type: 'Logs' as const, id: logId }],
    }),

    /** Poll for the analysis status/result */
    getAnalysisStatus: builder.query<AiAnalysis, string>({
      // `arg` is the logId
      query: (logId) => `/ai/log/${logId}/status`,
      providesTags: (result, error, logId) => [{ type: 'Logs' as const, id: logId }],
    }),
  }),
});

export const { useTriggerAnalysisMutation, useGetAnalysisStatusQuery } = aiApi;
