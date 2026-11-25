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
  CategoryActions,
  CategoryFormDialog,
  CategoryList,
  CategoryListSearchFilter,
  CategoryListTable,
  CategoryListTrashFilter,
  useCategoryMutations,
  type CategoryFormDialogPayload,
} from '@/features/library';
import { useDialogState } from '@/hooks/use-dialog';
import { usePortalBase } from '@/hooks/use-portal-base';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { Can } from '@casl/react';
import { RiAddLine } from '@remixicon/react';

const CategoriesPage = () => {
  const portalBase = usePortalBase();

  const createDialog = useDialogState(),
    updateDialog = useDialogState<CategoryFormDialogPayload>();

  const query = useResourceQuery({
      page: 1,
      limit: 10,
      order: { createdAt: 'desc' },
    }),
    mutations = useCategoryMutations();

  return (
    <Page className="min-h-svh">
      <CategoryFormDialog {...createDialog} />
      <CategoryFormDialog {...updateDialog} />

      <PageNav
        items={[
          { label: 'Dashboard', path: portalBase },
          { label: 'Library' },
          { label: 'Categories' },
        ]}
      />
      <PageHeader
        title="Categories"
        action={
          <Can I={'create'} a={'library:category'}>
            <Button onClick={() => createDialog.show()}>
              <RiAddLine /> Create category
            </Button>
          </Can>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <CategoryList query={query}>
              <div className="mb-8 flex flex-wrap gap-2">
                <div className="grow">
                  <CategoryListSearchFilter />
                </div>
                <CategoryListTrashFilter />
              </div>
              <CategoryListTable
                columnDef={[
                  {
                    id: 'no',
                    header: '#',
                    cell: NumberingCell,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'name',
                    header: ({ column }) => (
                      <SortableHeader column={column} title="Name" />
                    ),
                  },
                  {
                    accessorKey: 'description',
                    header: () => 'Description',
                    cell: ({ row }) => (
                      <p className="text-muted-foreground">
                        {row.original.description}
                      </p>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: ({ row: { original: category } }) => (
                      <CategoryActions
                        handlers={
                          query.state.trash
                            ? {
                                restore: () => mutations.restore(category),
                                delete: () => mutations.del(category),
                              }
                            : {
                                edit: () =>
                                  updateDialog.show({ id: category.id }),
                                remove: () => mutations.archive(category),
                              }
                        }
                      />
                    ),
                    enableSorting: false,
                  },
                ]}
              />
            </CategoryList>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
};

export default CategoriesPage;
