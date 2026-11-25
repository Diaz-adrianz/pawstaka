import {
  AsyncComboboxSingle,
  type AsyncComboboxSingleProps,
} from '@/components/shared/async-combobox';
import { BookApi } from '../api/book.api';
import type { Book } from '../types/book.type';

type BookComboboxItem = Pick<Book, 'id' | 'title' | 'stockAvailable'>;

function BookCombobox({
  ...props
}: Omit<
  AsyncComboboxSingleProps<BookComboboxItem>,
  'queryKey' | 'loadItems' | 'getItemKey' | 'getItemLabel'
>) {
  return (
    <AsyncComboboxSingle<BookComboboxItem>
      queryKey={['library', 'book', 'options']}
      loadItems={async (s) => {
        const res = await BookApi.findMany({
          ...(s && { search: `title:${s}` }),
          gt: 'stockAvailable:0',
          limit: 10,
        });
        return res.data.data.items;
      }}
      getItemKey={(book) => book.id}
      getItemLabel={(book) => book.title}
      {...props}
    />
  );
}

export { BookCombobox };
export type { BookComboboxItem };
