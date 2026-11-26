import { NumberingCell, SortableHeader } from '@/components/shared/data-table';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  MemberActions,
  MemberFormDialog,
  MemberList,
  MemberListSearchFilter,
  MemberListTable,
  MemberListTrashFilter,
  useMemberMutations,
  type MemberFormDialogPayload,
} from '@/features/library';
import { useDialogState } from '@/hooks/use-dialog';
import { usePortalBase } from '@/hooks/use-portal-base';
import { useResourceQuery } from '@/lib/resource-query/hooks/use-resource-query';
import { Can } from '@casl/react';
import { RiAddLine } from '@remixicon/react';

const MembersPage = () => {
  const portalBase = usePortalBase();

  const createDialog = useDialogState(),
    updateDialog = useDialogState<MemberFormDialogPayload>();

  const query = useResourceQuery({
      page: 1,
      limit: 10,
      order: { createdAt: 'desc' },
    }),
    mutations = useMemberMutations();

  return (
    <Page className="min-h-svh">
      <MemberFormDialog {...createDialog} />
      <MemberFormDialog {...updateDialog} />

      <PageNav
        items={[
          { label: 'Dashboard', path: portalBase },
          { label: 'Library' },
          { label: 'Members' },
        ]}
      />
      <PageHeader
        title="Members"
        action={
          <Can I={'create'} a={'library:member'}>
            <Button onClick={() => createDialog.show()}>
              <RiAddLine /> Create member
            </Button>
          </Can>
        }
      />
      <PageSection>
        <Card>
          <CardContent>
            <MemberList query={query}>
              <div className="mb-8 flex flex-wrap gap-2">
                <div className="grow">
                  <MemberListSearchFilter />
                </div>
                <MemberListTrashFilter />
              </div>
              <MemberListTable
                columnDef={[
                  {
                    id: 'no',
                    header: '#',
                    cell: NumberingCell,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'code',
                    header: ({ column }) => (
                      <SortableHeader column={column} title="Code" />
                    ),
                  },
                  {
                    accessorKey: 'name',
                    header: ({ column }) => (
                      <SortableHeader column={column} title="Name" />
                    ),
                  },
                  {
                    accessorKey: 'email',
                    header: () => 'Email',
                    cell: ({ row }) => row.original.email,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'phone',
                    header: () => 'Phone',
                    cell: ({ row }) => row.original.phone,
                    enableSorting: false,
                  },
                  {
                    accessorKey: 'active',
                    header: () => 'Active',
                    cell: ({ row }) => (
                      <Badge
                        variant={row.original.active ? 'default' : 'secondary'}
                      >
                        {row.original.active ? 'Active' : 'Inactive'}
                      </Badge>
                    ),
                    enableSorting: false,
                  },
                  {
                    id: 'action',
                    header: '',
                    cell: ({ row: { original: member } }) => (
                      <MemberActions
                        handlers={
                          query.state.trash
                            ? {
                                restore: () => mutations.restore(member),
                                delete: () => mutations.del(member),
                              }
                            : {
                                edit: () =>
                                  updateDialog.show({ id: member.id }),
                                remove: () => mutations.archive(member),
                              }
                        }
                      />
                    ),
                    enableSorting: false,
                  },
                ]}
              />
            </MemberList>
          </CardContent>
        </Card>
      </PageSection>
    </Page>
  );
};

export default MembersPage;
