import { useQuery } from '@tanstack/react-query';
import type { ApiParams } from '@/lib/axios/api.type';
import { CategoryApi } from './category.api';

export const categoryKeys = {
  all: ['library', 'category'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params: ApiParams) => [...categoryKeys.lists(), params] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export function useCategories(
  params: ApiParams = {},
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => CategoryApi.findMany(params),
    select: (d) => d.data.data,
    enabled,
  });
}

export function useCategory(
  id: string,
  { enabled = true }: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => CategoryApi.findOne(id),
    select: (d) => d.data.data,
    enabled: !!id && enabled,
  });
}
