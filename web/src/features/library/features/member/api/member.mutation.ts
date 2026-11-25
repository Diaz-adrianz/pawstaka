import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MemberApi } from './member.api';
import { memberKeys } from './member.query';
import type { MemberValues } from '../schemas/member.schema';

export function useCreateMember({ onSuccess }: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: MemberApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useUpdateMember({ onSuccess }: { onSuccess?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MemberValues }) =>
      MemberApi.update(id, values),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(id) });
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
      onSuccess?.();
    },
  });
}

export function useArchiveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => MemberApi.archive(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(id) });
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}

export function useRestoreMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => MemberApi.restore(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: memberKeys.detail(id) });
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}

export function useDeleteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: MemberApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: memberKeys.lists() });
    },
  });
}
