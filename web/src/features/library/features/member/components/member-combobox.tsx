import {
  AsyncComboboxSingle,
  type AsyncComboboxSingleProps,
} from '@/components/shared/async-combobox';
import { MemberApi } from '../api/member.api';
import type { Member } from '../types/member.type';

type MemberComboboxItem = Pick<Member, 'id' | 'code' | 'name'>;

function MemberCombobox({
  ...props
}: Omit<
  AsyncComboboxSingleProps<MemberComboboxItem>,
  'queryKey' | 'loadItems' | 'getItemKey' | 'getItemLabel'
>) {
  return (
    <AsyncComboboxSingle<MemberComboboxItem>
      queryKey={['library', 'member', 'options']}
      loadItems={async (s) => {
        const res = await MemberApi.findMany({
          ...(s && { search: `name:${s}` }),
          limit: 10,
        });
        return res.data.data.items;
      }}
      getItemKey={(member) => member.id}
      getItemLabel={(member) => `${member.code} — ${member.name}`}
      {...props}
    />
  );
}

export { MemberCombobox };
export type { MemberComboboxItem };
