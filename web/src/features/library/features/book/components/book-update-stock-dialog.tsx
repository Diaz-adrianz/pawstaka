import type { DialogState } from '@/hooks/use-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  updateBookStockSchema,
  type UpdateBookStockValues,
} from '../schemas/book.schema';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateBook } from '../api/book.mutation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useBook } from '../api/book.query';
import { NotFoundResourceEmpty } from '@/components/shared/not-found-empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';

type BookUpdateStockDialogPayload = { id: string };

function BookUpdateStockDialog({
  open,
  onOpenChange,
  hide,
  payload,
}: DialogState<BookUpdateStockDialogPayload>) {
  const { data, isLoading } = useBook(payload?.id ?? '', {
      enabled: !!payload?.id && open,
    }),
    updateApi = useUpdateBook({
      onSuccess() {
        hide();
      },
    });

  const form = useForm<UpdateBookStockValues>({
    resolver: yupResolver(updateBookStockSchema),
    mode: 'onChange',
    values: data && {
      stockTotal: data.stockTotal,
    },
  });

  const update = (values: UpdateBookStockValues) => {
    if (data)
      toast.promise(updateApi.mutateAsync({ id: data.id, data: values }), {
        loading: 'Updating book stock...',
        success: 'Book stock updated',
      });
  };

  const borrowed = (data?.stockTotal ?? 0) - (data?.stockAvailable ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Book Stock</DialogTitle>
        </DialogHeader>

        {!data && !isLoading && open ? (
          <NotFoundResourceEmpty resource="Book" />
        ) : (
          <>
            <ItemGroup className="mb-4 rounded-2xl border py-2">
              <Item size={'xs'}>
                <ItemContent>
                  <ItemTitle>Book</ItemTitle>
                </ItemContent>
                <ItemContent className="items-end">
                  <ItemTitle>{data?.title}</ItemTitle>
                  <ItemDescription>
                    {data?.category?.name} — {data?.author}
                  </ItemDescription>
                </ItemContent>
              </Item>
              <ItemSeparator className="m-0" />
              <Item size={'xs'}>
                <ItemContent>
                  <ItemTitle>Borrowed</ItemTitle>
                </ItemContent>
                <ItemContent className="items-end">
                  <ItemDescription>{borrowed}</ItemDescription>
                </ItemContent>
              </Item>
            </ItemGroup>

            <form
              id="form-book-update-stock"
              onSubmit={form.handleSubmit(update)}
              className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <Controller
                  name="stockTotal"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        aria-invalid={fieldState.invalid}
                        min={borrowed}
                      />
                      <FieldDescription>
                        Total stock cannot go below on borrowed count.
                      </FieldDescription>
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
                form="form-book-update-stock"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
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

export { BookUpdateStockDialog };
export type { BookUpdateStockDialogPayload };
