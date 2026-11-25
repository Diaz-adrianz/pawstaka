import { useConfirm } from '@/components/shared/confirm';
import { toast } from 'sonner';
import {
  useArchiveBook,
  useDeleteBook,
  useRestoreBook,
} from '../api/book.mutation';
import type { Book } from '../types/book.type';

function useBookMutations() {
  const confirm = useConfirm();

  const archiveApi = useArchiveBook(),
    restoreApi = useRestoreBook(),
    deleteApi = useDeleteBook();

  const archive = async (book: Pick<Book, 'id' | 'title'>) => {
    const ok = await confirm({
      title: 'Remove book?',
      description: `Remove "${book.title}"? You can restore it later.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(archiveApi.mutateAsync({ id: book.id }), {
        loading: 'Removing book...',
        success: 'Book removed',
      });
  };

  const restore = async (book: Pick<Book, 'id' | 'title'>) => {
    const ok = await confirm({
      title: 'Restore book?',
      description: `Restore "${book.title}"? It will be active again.`,
    });
    if (ok)
      toast.promise(restoreApi.mutateAsync({ id: book.id }), {
        loading: 'Restoring book...',
        success: 'Book restored',
      });
  };

  const del = async (book: Pick<Book, 'id' | 'title'>) => {
    const ok = await confirm({
      title: 'Delete book?',
      description: `Delete "${book.title}"? This cannot be undone.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(deleteApi.mutateAsync(book.id), {
        loading: 'Deleting book...',
        success: 'Book deleted',
      });
  };

  return { archive, restore, del };
}

export { useBookMutations };
