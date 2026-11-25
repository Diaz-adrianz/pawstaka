import type { ApiParams } from '@/lib/axios/api.type';
import { useQuery } from '@tanstack/react-query';
import { MemberApi } from './member.api';

export const memberKeys = {
  all: ['library', 'member'] as const,
  lists: () => [...memberKeys.all, 'list'] as const,
  list: (params: ApiParams) => [...memberKeys.lists(), params] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
};

export function useMembers(
  params: ApiParams = {},
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: () => MemberApi.findMany(params),
    select: (d) => d.data.data,
    enabled,
  });
}

export function useMember(
  id: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: memberKeys.detail(id),
    queryFn: () => MemberApi.findOne(id),
    select: (d) => d.data.data,
    enabled: !!id && enabled,
  });
}
