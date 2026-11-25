import { NumberingCell } from '@/components/shared/data-table';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LoanActions,
  LoanBorrowDialog,
  LoanList,
  LoanListTable,
  useLoanMutations,
} from '@/features/library';
import { useDialogState } from '@/hooks/use-dialog';
import { usePortalBase } from '@/hooks/use-portal-base';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { formatDate } from '@/utils/date';
import { Can } from '@casl/react';
import { RiAddLine } from '@remixicon/react';

const LoansPage = () => {
  const portalBase = usePortalBase();

  const borrowDialog = useDialogState();

  const query = useResourceQuery({
      page: 1,
      limit: 10,
      order: { borrowedAt: 'desc' },
    }),
    mutations = useLoanMutations();

  const status = query.state.eq?.status;

  return (
    <Page className="min-h-svh">
      <LoanBorrowDialog {...borrowDialog} />

      <PageNav
        items={[
          { label: 'Dashboard', path: portalBase },
          { label: 'Library' },
          { label: 'Loans' },
        ]}
      />
      <PageHeader
        title="Loans"
        action={
          <Can I={'create'} a={'library:loan'}>
            <Button onClick={() => borrowDialog.show()}>
              <RiAddLine /> Borrow book
            </Button>
          </Can>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <LoanList query={query}>
              <div className="mb-8">
                <Tabs
                  value={status ? String(status) : 'all'}
                  onValueChange={(next) =>
                    query.set(
                      'eq',
                      next === 'all' ? undefined : { status: next }
                    )
                  }
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="returned">Returned</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <LoanListTable
                columnDef={[
                  {
                    id: 'no',
                    header: '#',
                    cell: NumberingCell,
                    enableSorting: false,
                  },
                  {
                    id: 'book',
                    header: 'Book',
                    cell: ({ row }) => row.original.book?.title,
                    enableSorting: false,
                  },
                  {
                    id: 'member',
                    header: 'Member',
                    cell: ({ row }) => row.original.member?.name,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'borrowedAt',
                    header: 'Borrowed',
                    cell: ({ row }) => formatDate(row.original.borrowedAt, 'PP'),
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'dueAt',
                    header: 'Due',
                    cell: ({ row }) => formatDate(row.original.dueAt, 'PP'),
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <Badge
                        variant={
                          row.original.status === 'active'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {row.original.status === 'active'
                          ? 'Active'
                          : 'Returned'}
                      </Badge>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: ({ row: { original: loan } }) => (
                      <LoanActions
                        handlers={
                          loan.status === 'active'
                            ? { return: () => mutations.returnLoan(loan) }
                            : {}
                        }
                      />
                    ),
                    enableSorting: false,
                  },
                ]}
              />
            </LoanList>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
};

export default LoansPage;
