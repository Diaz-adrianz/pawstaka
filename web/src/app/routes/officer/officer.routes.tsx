import type { RouteObject } from 'react-router-dom';
import CategoriesPage from '../admin/categories/categories.page';
import BooksPage from '../admin/books/books.page';
import StockPage from '../admin/stock/stock.page';
import MembersPage from '../admin/library/members.page';
import LoansPage from '../admin/library/loans.page';
import ReportsPage from './library/reports.page';

const officerRoutes: RouteObject[] = [
  {
    path: '',
    element: <ReportsPage />,
  },
  {
    path: 'library',
    children: [
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'books', element: <BooksPage /> },
      { path: 'stock', element: <StockPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'loans', element: <LoansPage /> },
      { path: 'reports', element: <ReportsPage /> },
    ],
  },
];

export default officerRoutes;
