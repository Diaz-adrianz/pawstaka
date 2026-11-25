import {
  ResourceActions,
  type ResourceActionsProps,
} from '@/components/shared/resource-actions';
import {
  RiArrowGoBackLine,
  RiDeleteBack2Line,
  RiDeleteBinLine,
  RiEdit2Line,
} from '@remixicon/react';

type Keys = 'edit' | 'remove' | 'restore' | 'delete';

function MemberActions(
  props: Omit<ResourceActionsProps<Keys>, 'keys' | 'actions'>
) {
  return (
    <ResourceActions<Keys>
      actions={{
        edit: {
          icon: RiEdit2Line,
          label: 'Edit',
          can: { i: 'update', a: 'library:member' },
        },
        remove: {
          icon: RiDeleteBinLine,
          label: 'Remove',
          can: { i: 'archive', a: 'library:member' },
          variant: 'destructive',
        },
        restore: {
          icon: RiArrowGoBackLine,
          label: 'Restore',
          can: { i: 'restore', a: 'library:member' },
        },
        delete: {
          icon: RiDeleteBack2Line,
          label: 'Delete',
          can: { i: 'delete', a: 'library:member' },
          variant: 'destructive',
        },
      }}
      {...props}
    />
  );
}

export { MemberActions };
