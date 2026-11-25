import { Badge } from '@/components/ui/badge';
import { NumberingCell } from '@/components/shared/data-table';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookActions,
  BookDialog,
  BookList,
  BookListSearchFilter,
  BookListTable,
  BookStockFilter,
  type BookDialogPayload,
} from '@/features/library';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { Progress } from '@/components/ui/progress';
import { cn } from 'cn';
import { useDialogState } from '@/hooks/use-dialog';

const StockPage = () => {
  const detailDialog = useDialogState<BookDialogPayload>();

  const query = useResourceQuery({
    page: 1,
    limit: 10,
    order: { stockAvailable: 'asc' },
  });

  return (
    <Page className="min-h-svh">
      <BookDialog {...detailDialog} />

      <PageNav
        items={[
          { label: 'Dashboard', path: '/admin' },
          { label: 'Library' },
          { label: 'Stock' },
        ]}
      />
      <PageHeader title="Stock" />
      <PageSection>
        <Card>
          <CardContent>
            <BookList query={query}>
              <div className="mb-8 flex flex-wrap gap-2">
                <div className="grow">
                  <BookListSearchFilter />
                </div>
                <BookStockFilter query={query} />
              </div>
              <BookListTable
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
                    cell: ({ row }) => (
                      <div className="grid">
                        <p>{row.original.title}</p>
                        <span className="typo-caption text-muted-foreground">
                          {row.original.category?.name} — {row.original.author}
                        </span>
                      </div>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'stock',
                    header: 'Stock',
                    cell: ({ row }) => {
                      const { stockAvailable, stockTotal } = row.original;
                      const percent =
                        stockTotal > 0
                          ? (stockAvailable / stockTotal) * 100
                          : 0;
                      const indicator =
                        stockAvailable === 0
                          ? '[&>div]:bg-destructive'
                          : stockAvailable <= 3
                            ? '[&>div]:bg-warning'
                            : '[&>div]:bg-success';
                      const text =
                        stockAvailable === 0
                          ? 'text-destructive'
                          : stockAvailable <= 3
                            ? 'text-warning'
                            : 'text-success';

                      return (
                        <div className="flex w-60 flex-col gap-1">
                          <Progress
                            value={percent}
                            className={cn('h-2', indicator)}
                          />
                          <span className={cn('typo-caption', text)}>
                            {stockAvailable} / {stockTotal} available
                          </span>
                        </div>
                      );
                    },
                    enableSorting: false,
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    cell: ({ row }) => {
                      const stock = row.original.stockAvailable;
                      return (
                        <Badge
                          variant={
                            stock === 0
                              ? 'destructive'
                              : stock <= 3
                                ? 'warning'
                                : 'success'
                          }
                        >
                          {stock === 0
                            ? 'Out of stock'
                            : stock <= 3
                              ? 'Low'
                              : 'Available'}
                        </Badge>
                      );
                    },
                    enableSorting: false,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: ({ row: { original: book } }) => (
                      <BookActions
                        handlers={{
                          view: () => detailDialog.show({ id: book.id }),
                        }}
                      />
                    ),
                    enableSorting: false,
                  },
                ]}
              />
            </BookList>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
};

export default StockPage;
