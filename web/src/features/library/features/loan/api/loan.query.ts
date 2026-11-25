import type { ApiParams } from '@/lib/axios/api.type';
import { useQuery } from '@tanstack/react-query';
import { LoanApi } from './loan.api';

export const loanKeys = {
  all: ['library', 'loan'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (params: ApiParams) => [...loanKeys.lists(), params] as const,
  detail: (id: string) => [...loanKeys.all, 'detail', id] as const,
};

export function useLoans(
  params: ApiParams = {},
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: loanKeys.list(params),
    queryFn: () => LoanApi.findMany(params),
    select: (d) => d.data.data,
    enabled,
  });
}

export function useLoan(
  id: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => LoanApi.findOne(id),
    select: (d) => d.data.data,
    enabled: !!id && enabled,
  });
}
