import {
  AsyncComboboxSingle,
  type AsyncComboboxSingleProps,
} from '@/components/shared/async-combobox';
import { CategoryApi } from '../api/category.api';
import type { Category } from '../types/category.type';

type CategoryComboboxItem = Pick<Category, 'id' | 'name'>;

function CategoryCombobox({
  ...props
}: Omit<
  AsyncComboboxSingleProps<CategoryComboboxItem>,
  'queryKey' | 'loadItems' | 'getItemKey' | 'getItemLabel'
>) {
  return (
    <AsyncComboboxSingle<CategoryComboboxItem>
      queryKey={['library', 'category', 'options']}
      loadItems={async (s) => {
        const res = await CategoryApi.findMany({
          ...(s && { search: `name:${s}` }),
          limit: 10,
        });
        return res.data.data.items;
      }}
      getItemKey={(category) => category.id}
      getItemLabel={(category) => category.name}
      {...props}
    />
  );
}

export { CategoryCombobox };
export type { CategoryComboboxItem };
