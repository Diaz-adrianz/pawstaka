import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryApi } from './category.api';
import { categoryKeys } from './category.query';
import type { CategoryValues } from '../schemas/category.schema';

export function useCreateCategory({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CategoryApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useUpdateCategory({
  onSuccess,
}: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryValues }) =>
      CategoryApi.update(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useArchiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => CategoryApi.archive(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useRestoreCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => CategoryApi.restore(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: CategoryApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
