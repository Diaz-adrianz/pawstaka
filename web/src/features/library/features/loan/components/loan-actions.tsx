import {
  ResourceActions,
  type ResourceActionsProps,
} from '@/components/shared/resource-actions';
import { RiArrowGoBackLine } from '@remixicon/react';

type Keys = 'return';

function LoanActions(
  props: Omit<ResourceActionsProps<Keys>, 'keys' | 'actions'>
) {
  return (
    <ResourceActions<Keys>
      actions={{
        return: {
          icon: RiArrowGoBackLine,
          label: 'Return',
          can: { i: 'return', a: 'library:loan' },
        },
      }}
      {...props}
    />
  );
}

export { LoanActions };
