export type ReportSummary = {
  books: {
    totalTitles: number;
    totalStock: number;
    availableStock: number;
  };
  members: {
    total: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    overdue: number;
    returned: number;
  };
  topBooks: {
    bookId: string;
    title: string;
    total: number;
  }[];
};
