import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { ResourceListPagination } from '@/components/shared/resource-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLoans } from '@/features/library';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { formatDate } from '@/utils/date';

const MyLoansPage = () => {
  const query = useResourceQuery({
    page: 1,
    limit: 10,
    order: { borrowedAt: 'desc' },
  });

  const { data, isLoading } = useLoans(query.params);

  return (
    <Page className="min-h-svh">
      <PageNav items={[{ label: 'My loans' }]} />
      <PageHeader title="My loans" />
      <PageSection>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Borrowed</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Returned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length ? (
                  data.items.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.book?.title}</TableCell>
                      <TableCell>
                        {formatDate(loan.borrowedAt, 'PP')}
                      </TableCell>
                      <TableCell>{formatDate(loan.dueAt, 'PP')}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            loan.status === 'active' ? 'default' : 'secondary'
                          }
                        >
                          {loan.status === 'active' ? 'Active' : 'Returned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {loan.returnedAt ? formatDate(loan.returnedAt, 'PP') : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-muted-foreground"
                    >
                      {isLoading ? 'Loading...' : 'No loans found.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="mt-6">
              <ResourceListPagination
                total={data?.totalItems ?? 0}
                page={query.state.page}
                onPrev={query.state.page > 1 ? () => query.set('page', query.state.page - 1) : undefined}
                onNext={
                  data && query.state.page < data.totalPages
                    ? () => query.set('page', query.state.page + 1)
                    : undefined
                }
              />
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
};

export default MyLoansPage;
