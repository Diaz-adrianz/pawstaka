import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundResourceEmpty } from '@/components/shared/not-found-empty';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../api/category.mutation';
import { useCategory } from '../api/category.query';
import {
  categorySchema,
  type CategoryValues,
} from '../schemas/category.schema';

type CategoryFormDialogPayload = { id: string };

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  hide: () => void;
  payload?: CategoryFormDialogPayload;
};

function CategoryFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
}: CategoryFormDialogProps) {
  const editing = !!payload;

  const { data, isLoading } = useCategory(payload?.id ?? '', {
    enabled: editing && open,
  });

  const form = useForm<CategoryValues>({
    resolver: yupResolver(categorySchema),
    mode: 'onChange',
    defaultValues: { name: '', description: '' },
    values: data
      ? { name: data.name, description: data.description ?? '' }
      : undefined,
  });

  const createApi = useCreateCategory({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const updateApi = useUpdateCategory({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const save = (values: CategoryValues) => {
    if (payload)
      toast.promise(
        updateApi.mutateAsync({ id: payload.id, values }),
        {
          loading: 'Updating category...',
          success: 'Category updated',
        }
      );
    else
      toast.promise(createApi.mutateAsync(values), {
        loading: 'Creating category...',
        success: 'Category created',
      });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>
            {editing ? 'Update Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        {editing && !data && !isLoading && open ? (
          <NotFoundResourceEmpty resource="Category" />
        ) : (
          <>
            <form
              id="form-category"
              onSubmit={form.handleSubmit(save)}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        rows={4}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-category"
                disabled={
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isLoading
                }
              >
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { CategoryFormDialog };
export type { CategoryFormDialogPayload };
