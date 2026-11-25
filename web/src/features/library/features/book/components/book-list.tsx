import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { ResourceListTrashFilter } from '@/components/shared/resource-list';
import type { ApiPaginatedResponse } from '@/lib/axios/api.type';
import type { ConditionMap } from '@/lib/resource-query/resource-query.type';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { useBooks } from '../api/book.query';
import type { Book } from '../types/book.type';

type BookListContextProps = {
  query: ReturnType<typeof useResourceQuery>;
  data: ApiPaginatedResponse<Book>['data'] | undefined;
  isLoading: boolean;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const BookListContext = createContext<BookListContextProps | null>(null);

function useBookList() {
  const context = useContext(BookListContext);
  if (!context) throw new Error('useBookList must be used within a BookList.');

  return context;
}

function BookList({
  children,
  query: controlledQuery,
}: {
  children: ReactNode;
  query?: ReturnType<typeof useResourceQuery>;
}) {
  const internalQuery = useResourceQuery(),
    query = controlledQuery ?? internalQuery;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useBooks(query.params);

  return (
    <BookListContext.Provider
      value={{
        query,
        data,
        isLoading,
        rowSelection,
        setRowSelection,
      }}
    >
      {children}
    </BookListContext.Provider>
  );
}

function BookListSearchFilter() {
  const { isLoading, data, query } = useBookList();

  return (
    <SearchInput
      isLoading={isLoading}
      resultsCount={data?.totalItems}
      onChange={(value) =>
        query.set(
          'search',
          value ? { title: value, author: value, isbn: value } : undefined
        )
      }
    />
  );
}

function BookListTrashFilter() {
  const { query } = useBookList();

  return (
    <ResourceListTrashFilter
      value={query.state.trash}
      onValueChange={(s) => query.set('trash', s)}
    />
  );
}

function BookListTable({
  columnDef,
}: {
  columnDef: ColumnDef<
    NonNullable<BookListContextProps['data']>['items'][number]
  >[];
}) {
  const { data, isLoading, query, rowSelection, setRowSelection } =
    useBookList();

  const pagination = {
    pageIndex: query.state.page - 1,
    pageSize: query.state.limit,
  };

  const sorting = Object.entries(query.state.order ?? {}).map(([k, v]) => ({
    id: k,
    desc: v === 'desc',
  }));

  return (
    <DataTable
      columns={columnDef}
      data={data?.items ?? []}
      pageCount={data?.totalPages ?? 0}
      totalItems={data?.totalItems ?? 0}
      getRowId={(row) => row.id}
      pagination={pagination}
      onPaginationChange={(up) => {
        const p = typeof up === 'function' ? up(pagination) : up;
        query.batch([
          { type: 'set', key: 'page', value: p.pageIndex + 1 },
          { type: 'set', key: 'limit', value: p.pageSize },
        ]);
      }}
      sorting={sorting}
      onSortingChange={(up) => {
        const s = typeof up === 'function' ? up(sorting) : up;
        query.set(
          'order',
          s.reduce<ConditionMap>((acc, { id, desc }) => {
            acc[id] = desc ? 'desc' : 'asc';
            return acc;
          }, {})
        );
      }}
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
      isLoading={isLoading}
    />
  );
}

export { BookList, BookListSearchFilter, BookListTrashFilter, BookListTable };
