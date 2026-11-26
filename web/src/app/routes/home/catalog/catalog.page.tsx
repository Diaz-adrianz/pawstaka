import { Page, PageHeader, PageSection } from '@/components/shared/page';
import { ResourceListPagination } from '@/components/shared/resource-list';
import { SearchInput } from '@/components/shared/search-input';
import {
  BookCard,
  BookDialog,
  CategoryCombobox,
  useBooks,
  type BookDialogPayload,
} from '@/features/library';
import { useDialogState } from '@/hooks/use-dialog';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';

const CatalogPage = () => {
  const detailDialog = useDialogState<BookDialogPayload>();

  const query = useResourceQuery({
    page: 1,
    limit: 12,
    order: { title: 'asc' },
  });

  const { data, isLoading } = useBooks(query.params);

  return (
    <Page className="min-h-svh">
      <BookDialog {...detailDialog} />
      <PageHeader
        title="Catalog"
        description="Browse our full collection of books."
      />
      <PageSection>
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="grow">
            <SearchInput
              isLoading={isLoading}
              resultsCount={data?.totalItems}
              onChange={(value) =>
                query.set(
                  'search',
                  value
                    ? { title: value, author: value, isbn: value }
                    : undefined
                )
              }
            />
          </div>
          <CategoryCombobox
            placeholder="Choose categories"
            onValueChange={(categories) =>
              query.set(
                'in',
                categories.length
                  ? { categoryId: categories.map((c) => c.id) }
                  : undefined
              )
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data?.items.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onViewClick={() => detailDialog.show({ id: book.id })}
            />
          ))}
        </div>

        <div className="mt-6">
          <ResourceListPagination
            total={data?.totalItems ?? 0}
            page={query.state.page}
            onPrev={
              query.state.page > 1
                ? () => query.set('page', query.state.page - 1)
                : undefined
            }
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
