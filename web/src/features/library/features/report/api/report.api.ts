import { apiClient } from '@/lib/axios/api.client';
import type { ApiResponse } from '@/lib/axios/api.type';
import type { ReportSummary } from '../types/report.type';

export const ReportApi = {
  summary: (params: { from?: string; to?: string }) =>
    apiClient.get<ApiResponse<ReportSummary>>('/library/reports/summary', {
      params,
    }),
};
