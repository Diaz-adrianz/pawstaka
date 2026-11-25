export type Loan = {
  id: string;
  memberId: string;
  bookId: string;
  member?: {
    id: string;
    code: string;
    name: string;
  };
  book?: {
    id: string;
    title: string;
  };
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: 'active' | 'returned';
  createdAt: string;
};
