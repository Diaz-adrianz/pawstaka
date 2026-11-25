import type { ApiParams } from '@/lib/axios/api.type';
import { useQuery } from '@tanstack/react-query';
import { BookApi } from './book.api';

export const bookKeys = {
  all: ['library', 'book'] as const,
  lists: () => [...bookKeys.all, 'list'] as const,
  list: (params: ApiParams) => [...bookKeys.lists(), params] as const,
  detail: (id: string) => [...bookKeys.all, 'detail', id] as const,
};

export function useBooks(
  params: ApiParams = {},
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: bookKeys.list(params),
    queryFn: () => BookApi.findMany(params),
    select: (d) => d.data.data,
    enabled,
  });
}

export function useBook(
  id: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => BookApi.findOne(id),
    select: (d) => d.data.data,
    enabled: !!id && enabled,
  });
}
