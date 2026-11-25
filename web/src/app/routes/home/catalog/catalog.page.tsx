import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { ResourceListPagination } from '@/components/shared/resource-list';
import { SearchInput } from '@/components/shared/search-input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useBooks } from '@/features/library';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';

const CatalogPage = () => {
  const query = useResourceQuery({
    page: 1,
    limit: 12,
    order: { title: 'asc' },
  });

  const { data, isLoading } = useBooks(query.params);

  return (
    <Page className="min-h-svh">
      <PageNav items={[{ label: 'Catalog' }]} />
      <PageHeader title="Catalog" />
      <PageSection>
        <div className="mb-6 max-w-md">
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((book) => (
            <Card key={book.id}>
              <CardHeader>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {book.category?.name ?? 'Uncategorized'}
                </p>
                <p className="text-muted-foreground">
                  ISBN: {book.isbn ?? '—'}
                </p>
                <Badge
                  variant={
                    book.stockAvailable === 0
                      ? 'destructive'
                      : book.stockAvailable <= 3
                        ? 'secondary'
                        : 'default'
                  }
                >
                  {book.stockAvailable === 0
                    ? 'Out of stock'
                    : book.stockAvailable <= 3
                      ? 'Low'
                      : 'Available'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

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
      </PageSection>
    </Page>
  );
};

export default CatalogPage;
