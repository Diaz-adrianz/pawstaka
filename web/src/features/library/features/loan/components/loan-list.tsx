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
import type { ApiPaginatedResponse } from '@/lib/axios/api.type';
import type { ConditionMap } from '@/lib/resource-query/resource-query.type';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { useLoans } from '../api/loan.query';
import type { Loan } from '../types/loan.type';

type LoanListContextProps = {
  query: ReturnType<typeof useResourceQuery>;
  data: ApiPaginatedResponse<Loan>['data'] | undefined;
  isLoading: boolean;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const LoanListContext = createContext<LoanListContextProps | null>(null);

function useLoanList() {
  const context = useContext(LoanListContext);
  if (!context) throw new Error('useLoanList must be used within a LoanList.');

  return context;
}

function LoanList({
  children,
  query: controlledQuery,
}: {
  children: ReactNode;
  query?: ReturnType<typeof useResourceQuery>;
}) {
  const internalQuery = useResourceQuery(),
    query = controlledQuery ?? internalQuery;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useLoans(query.params);

  return (
    <LoanListContext.Provider
      value={{
        query,
        data,
        isLoading,
        rowSelection,
        setRowSelection,
      }}
    >
      {children}
    </LoanListContext.Provider>
  );
}

function LoanListTable({
  columnDef,
}: {
  columnDef: ColumnDef<
    NonNullable<LoanListContextProps['data']>['items'][number]
  >[];
}) {
  const { data, isLoading, query, rowSelection, setRowSelection } =
    useLoanList();

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

export { LoanList, LoanListTable };
