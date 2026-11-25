import { NumberingCell, SortableHeader } from '@/components/shared/data-table';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookActions,
  BookDialog,
  type BookDialogPayload,
  BookFormDialog,
  BookList,
  BookListSearchFilter,
  BookListTable,
  BookListTrashFilter,
  CategoryCombobox,
  useBookMutations,
  type BookFormDialogPayload,
} from '@/features/library';
import { useDialogState } from '@/hooks/use-dialog';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { Can } from '@casl/react';
import { RiAddLine } from '@remixicon/react';

const BooksPage = () => {
  const createDialog = useDialogState(),
    updateDialog = useDialogState<BookFormDialogPayload>(),
    detailDialog = useDialogState<BookDialogPayload>();

  const query = useResourceQuery({
      page: 1,
      limit: 10,
      order: { createdAt: 'desc' },
    }),
    mutations = useBookMutations();

  return (
    <Page className="min-h-svh">
      <BookFormDialog {...createDialog} />
      <BookFormDialog {...updateDialog} />
      <BookDialog {...detailDialog} />

      <PageNav
        items={[
          { label: 'Dashboard', path: '/officer' },
          { label: 'Library' },
          { label: 'Books' },
        ]}
      />
      <PageHeader
        title="Books"
        action={
          <Can I={'create'} a={'library:book'}>
            <Button onClick={() => createDialog.show()}>
              <RiAddLine /> Create book
            </Button>
          </Can>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <BookList query={query}>
              <div className="mb-8 flex flex-wrap gap-2">
                <div className="grow">
                  <BookListSearchFilter />
                </div>
                <CategoryCombobox
                  placeholder="Filter by category"
                  onValueChange={(category) =>
                    query.set(
                      'eq',
                      category ? { categoryId: category.id } : undefined
                    )
                  }
                />
                <BookListTrashFilter />
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
                    header: ({ column }) => (
                      <SortableHeader column={column} title="Title" />
                    ),
                  },
                  {
                    accessorKey: 'author',
                    header: () => 'Author',
                    cell: ({ row }) => (
                      <p className="text-muted-foreground">
                        {row.original.author}
                      </p>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'category',
                    header: () => 'Category',
                    cell: ({ row }) => (
                      <p className="text-muted-foreground">
                        {row.original.category?.name}
                      </p>
                    ),
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'isbn',
                    header: () => 'ISBN',
                    cell: ({ row }) => (
                      <p className="text-muted-foreground">
                        {row.original.isbn}
                      </p>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: ({ row: { original: book } }) => (
                      <BookActions
                        handlers={
                          query.state.trash
                            ? {
                                restore: () => mutations.restore(book),
                                delete: () => mutations.del(book),
                              }
                            : {
                                view: () => detailDialog.show({ id: book.id }),
                                edit: () => updateDialog.show({ id: book.id }),
                                remove: () => mutations.archive(book),
                              }
                        }
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

export default BooksPage;
