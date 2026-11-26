import type { RouteObject } from 'react-router-dom';
import OfficerPage from './officer.page';
import CategoriesPage from './categories/categories.page';
import BooksPage from './books/books.page';
import StockPage from './stock/stock.page';
// import MembersPage from './members/members.page';
// import LoansPage from './loans/loans.page';

const officerRoutes: RouteObject[] = [
  {
    path: '',
    element: <OfficerPage />,
  },
  {
    path: 'library',
    children: [
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'books', element: <BooksPage /> },
      { path: 'stock', element: <StockPage /> },
      // { path: 'members', element: <MembersPage /> },
      // { path: 'loans', element: <LoansPage /> },
    ],
  },
];

export default officerRoutes;
