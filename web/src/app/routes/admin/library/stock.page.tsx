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
  BookList,
  BookListSearchFilter,
  BookListTable,
  BookStockFilter,
} from '@/features/library';
import { usePortalBase } from '@/hooks/use-portal-base';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';

const StockPage = () => {
  const portalBase = usePortalBase();

  const query = useResourceQuery({
    page: 1,
    limit: 10,
    order: { stockAvailable: 'asc' },
  });

  return (
    <Page className="min-h-svh">
      <PageNav
        items={[
          { label: 'Dashboard', path: portalBase },
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
                    accessorKey: 'title',
                    header: 'Title',
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'author',
                    header: 'Author',
                    enableSorting: false,
                  },
                  {
                    id: 'category',
                    header: 'Category',
                    cell: ({ row }) => row.original.category?.name,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'stockAvailable',
                    header: 'Available',
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'stockTotal',
                    header: 'Total',
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
                                ? 'secondary'
                                : 'default'
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
