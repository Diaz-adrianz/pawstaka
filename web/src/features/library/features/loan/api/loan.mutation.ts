import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookKeys } from '../../book/api/book.query';
import { LoanApi } from './loan.api';
import { loanKeys } from './loan.query';

function useInvalidateLoanSideEffects() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: loanKeys.lists() });
    qc.invalidateQueries({ queryKey: bookKeys.lists() });
    qc.invalidateQueries({ queryKey: ['library', 'report'] });
  };
}

export function useBorrowLoan({ onSuccess }: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateLoanSideEffects();
  return useMutation({
    mutationFn: LoanApi.borrow,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
}

export function useReturnLoan({ onSuccess }: { onSuccess?: () => void } = {}) {
  const invalidate = useInvalidateLoanSideEffects();
  return useMutation({
    mutationFn: LoanApi.returnLoan,
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });
}
