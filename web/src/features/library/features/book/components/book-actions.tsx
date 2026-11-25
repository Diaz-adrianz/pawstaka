import {
  ResourceActions,
  type ResourceActionsProps,
} from '@/components/shared/resource-actions';
import {
  RiArrowGoBackLine,
  RiDeleteBack2Line,
  RiDeleteBinLine,
  RiEdit2Line,
  RiExpandDiagonalLine,
} from '@remixicon/react';

type Keys = 'view' | 'edit' | 'remove' | 'restore' | 'delete';

function BookActions(
  props: Omit<ResourceActionsProps<Keys>, 'keys' | 'actions'>
) {
  return (
    <ResourceActions<Keys>
      actions={{
        view: {
          icon: RiExpandDiagonalLine,
          label: 'View',
          can: { i: 'read', a: 'library:book' },
        },
        edit: {
          icon: RiEdit2Line,
          label: 'Edit',
          can: { i: 'update', a: 'library:book' },
        },
        remove: {
          icon: RiDeleteBinLine,
          label: 'Remove',
          can: { i: 'archive', a: 'library:book' },
          variant: 'destructive',
        },
        restore: {
          icon: RiArrowGoBackLine,
          label: 'Restore',
          can: { i: 'restore', a: 'library:book' },
        },
        delete: {
          icon: RiDeleteBack2Line,
          label: 'Delete',
          can: { i: 'delete', a: 'library:book' },
          variant: 'destructive',
        },
      }}
      {...props}
    />
  );
}

export { BookActions };
