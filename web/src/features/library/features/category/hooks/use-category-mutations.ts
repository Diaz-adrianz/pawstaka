import { useConfirm } from '@/components/shared/confirm';
import { toast } from 'sonner';
import {
  useArchiveCategory,
  useDeleteCategory,
  useRestoreCategory,
} from '../api/category.mutation';
import type { Category } from '../types/category.type';

function useCategoryMutations() {
  const confirm = useConfirm();

  const archiveApi = useArchiveCategory(),
    restoreApi = useRestoreCategory(),
    deleteApi = useDeleteCategory();

  const archive = async (category: Pick<Category, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Remove category?',
      description: `Remove "${category.name}"? You can restore it later.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(archiveApi.mutateAsync({ id: category.id }), {
        loading: 'Removing category...',
        success: 'Category removed',
      });
  };

  const restore = async (category: Pick<Category, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Restore category?',
      description: `Restore "${category.name}"? It will be active again.`,
    });
    if (ok)
      toast.promise(restoreApi.mutateAsync({ id: category.id }), {
        loading: 'Restoring category...',
        success: 'Category restored',
      });
  };

  const del = async (category: Pick<Category, 'id' | 'name'>) => {
    const ok = await confirm({
      title: 'Delete category?',
      description: `Delete "${category.name}"? This cannot be undone.`,
      confirmVariant: 'destructive',
    });
    if (ok)
      toast.promise(deleteApi.mutateAsync(category.id), {
        loading: 'Deleting category...',
        success: 'Category deleted',
      });
  };

  return { archive, restore, del };
}

export { useCategoryMutations };
