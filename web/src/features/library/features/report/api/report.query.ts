import { useQuery } from '@tanstack/react-query';
import { ReportApi } from './report.api';

export function useReportSummary({ from, to }: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['library', 'report', 'summary', { from, to }],
    queryFn: () => ReportApi.summary({ from, to }),
    select: (d) => d.data.data,
  });
}
