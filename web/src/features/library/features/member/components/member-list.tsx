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
import { useMembers } from '../api/member.query';
import type { Member } from '../types/member.type';

type MemberListContextProps = {
  query: ReturnType<typeof useResourceQuery>;
  data: ApiPaginatedResponse<Member>['data'] | undefined;
  isLoading: boolean;
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
};

const MemberListContext = createContext<MemberListContextProps | null>(null);

function useMemberList() {
  const context = useContext(MemberListContext);
  if (!context)
    throw new Error('useMemberList must be used within a MemberList.');

  return context;
}

function MemberList({
  children,
  query: controlledQuery,
}: {
  children: ReactNode;
  query?: ReturnType<typeof useResourceQuery>;
}) {
  const internalQuery = useResourceQuery(),
    query = controlledQuery ?? internalQuery;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data, isLoading } = useMembers(query.params);

  return (
    <MemberListContext.Provider
      value={{
        query,
        data,
        isLoading,
        rowSelection,
        setRowSelection,
      }}
    >
      {children}
    </MemberListContext.Provider>
  );
}

function MemberListSearchFilter() {
  const { isLoading, data, query } = useMemberList();

  return (
    <SearchInput
      isLoading={isLoading}
      resultsCount={data?.totalItems}
      onChange={(value) =>
        query.set(
          'search',
          value ? { code: value, name: value, email: value } : undefined
        )
      }
    />
  );
}

function MemberListTrashFilter() {
  const { query } = useMemberList();

  return (
    <ResourceListTrashFilter
      value={query.state.trash}
      onValueChange={(s) => query.set('trash', s)}
    />
  );
}

function MemberListTable({
  columnDef,
}: {
  columnDef: ColumnDef<
    NonNullable<MemberListContextProps['data']>['items'][number]
  >[];
}) {
  const { data, isLoading, query, rowSelection, setRowSelection } =
    useMemberList();

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

export { MemberList, MemberListSearchFilter, MemberListTrashFilter, MemberListTable };
