import { useConfirm } from '@/components/shared/confirm';
import { toast } from 'sonner';
import { useReturnLoan } from '../api/loan.mutation';
import type { Loan } from '../types/loan.type';

function useLoanMutations() {
  const confirm = useConfirm();
  const returnApi = useReturnLoan();

  const returnLoan = async (
    loan: Pick<Loan, 'id'> & { book?: { title: string } }
  ) => {
    const ok = await confirm({
      title: 'Return book?',
      description: loan.book
        ? `Return "${loan.book.title}"? Stock will increase by one.`
        : 'Return this book? Stock will increase by one.',
    });
    if (ok)
      toast.promise(returnApi.mutateAsync(loan.id), {
        loading: 'Returning book...',
        success: 'Book returned',
      });
  };

  return { returnLoan };
}

export { useLoanMutations };
