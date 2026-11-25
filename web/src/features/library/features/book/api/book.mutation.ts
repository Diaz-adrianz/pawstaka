import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookApi } from './book.api';
import { bookKeys } from './book.query';
import type { BookValues } from '../schemas/book.schema';

export function useCreateBook({ onSuccess }: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: BookApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useUpdateBook({ onSuccess }: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: BookValues }) =>
      BookApi.update(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(id) });
      qc.invalidateQueries({ queryKey: bookKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useArchiveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => BookApi.archive(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(id) });
      qc.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

export function useRestoreBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => BookApi.restore(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: bookKeys.detail(id) });
      qc.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}

export function useDeleteBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: BookApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookKeys.lists() });
    },
  });
}
