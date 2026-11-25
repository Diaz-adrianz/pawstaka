import { useConfirm } from '@/components/shared/confirm';
import { toast } from 'sonner';
import {
  useArchiveMember,
  useDeleteMember,
  useRestoreMember,
} from '../api/member.mutation';
import type { Member } from '../types/member.type';

function useMemberMutations() {
  const confirm = useConfirm();

  const archiveApi = useArchiveMember(),
    restoreApi = useRestoreMember(),
    deleteApi = useDeleteMember();

  const archive = async (member: Pick<Member, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Remove member?',
      description: `Remove "${member.name}"? You can restore it later.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(archiveApi.mutateAsync({ id: member.id }), {
        loading: 'Removing member...',
        success: 'Member removed',
      });
  };

  const restore = async (member: Pick<Member, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Restore member?',
      description: `Restore "${member.name}"? It will be active again.`,
    });
    if (ok)
      toast.promise(restoreApi.mutateAsync({ id: member.id }), {
        loading: 'Restoring member...',
        success: 'Member restored',
      });
  };

  const del = async (member: Pick<Member, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Delete member?',
      description: `Delete "${member.name}"? This cannot be undone.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(deleteApi.mutateAsync(member.id), {
        loading: 'Deleting member...',
        success: 'Member deleted',
      });
  };

  return { archive, restore, del };
}

export { useMemberMutations };
