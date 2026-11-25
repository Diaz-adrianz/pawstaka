import * as y from 'yup';

const loanSchema = y.object({
  memberId: y.string().required('Member is required'),
  bookId: y.string().required('Book is required'),
  dueAt: y.string().required('Due date is required'),
});

type LoanValues = y.InferType<typeof loanSchema>;

export { loanSchema };
export type { LoanValues };
