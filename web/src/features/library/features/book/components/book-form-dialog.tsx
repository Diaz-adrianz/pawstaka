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
import { useCreateBook, useUpdateBook } from '../api/book.mutation';
import { useBook } from '../api/book.query';
import { bookSchema, type BookValues } from '../schemas/book.schema';
import { CategoryCombobox } from '../../category/components/category-combobox';

type BookFormDialogPayload = { id: string };

type BookFormDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  hide: () => void;
  payload?: BookFormDialogPayload;
};

const numberInputValue = (value: number | undefined) =>
  value === undefined || Number.isNaN(value) ? '' : value;

function BookFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
}: BookFormDialogProps) {
  const editing = !!payload;

  const { data, isLoading } = useBook(payload?.id ?? '', {
    enabled: editing && open,
  });

  const form = useForm<BookValues>({
    resolver: yupResolver(bookSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      subtitle: '',
      author: '',
      isbn: '',
      publisher: '',
      publishedYear: undefined,
      publishedPlace: '',
      edition: '',
      language: '',
      pages: undefined,
      description: '',
      shelfLocation: '',
      categoryId: '',
      stockTotal: 0,
    },
    values: data
      ? {
          title: data.title,
          subtitle: data.subtitle ?? '',
          author: data.author,
          isbn: data.isbn ?? '',
          publisher: data.publisher ?? '',
          publishedYear: data.publishedYear ?? undefined,
          publishedPlace: data.publishedPlace ?? '',
          edition: data.edition ?? '',
          language: data.language ?? '',
          pages: data.pages ?? undefined,
          description: data.description ?? '',
          shelfLocation: data.shelfLocation ?? '',
          categoryId: data.categoryId,
          stockTotal: data.stockTotal,
        }
      : undefined,
  });

  const createApi = useCreateBook({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const updateApi = useUpdateBook({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const save = (values: BookValues) =>
    payload
      ? toast.promise(updateApi.mutateAsync({ id: payload.id, values }), {
          loading: 'Updating book...',
          success: 'Book updated',
        })
      : toast.promise(createApi.mutateAsync(values), {
          loading: 'Creating book...',
          success: 'Book created',
        });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>{editing ? 'Update Book' : 'Create Book'}</DialogTitle>
        </DialogHeader>

        {editing && !data && !isLoading && open ? (
          <NotFoundResourceEmpty resource="Book" />
        ) : (
          <>
            <form
              id="form-book"
              onSubmit={form.handleSubmit(save)}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.title}>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      aria-invalid={!!form.formState.errors.title}
                      {...form.register('title')}
                    />
                    {form.formState.errors.title && (
                      <FieldError errors={[form.formState.errors.title]} />
                    )}
                  </Field>

                  <Field data-invalid={!!form.formState.errors.author}>
                    <FieldLabel htmlFor="author">Author</FieldLabel>
                    <Input
                      id="author"
                      aria-invalid={!!form.formState.errors.author}
                      {...form.register('author')}
                    />
                    {form.formState.errors.author && (
                      <FieldError errors={[form.formState.errors.author]} />
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!form.formState.errors.subtitle}>
                  <FieldLabel htmlFor="subtitle">Subtitle</FieldLabel>
                  <Input id="subtitle" {...form.register('subtitle')} />
                </Field>

                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <CategoryCombobox
                        key={data?.id ?? 'new'}
                        id={field.name}
                        name={field.name}
                        defaultValue={
                          data?.category
                            ? {
                                id: data.category.id,
                                name: data.category.name,
                              }
                            : undefined
                        }
                        onValueChange={(category) =>
                          field.onChange(category?.id ?? '')
                        }
                        onBlur={field.onBlur}
                        invalid={fieldState.invalid}
                        placeholder="Select category"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="isbn">ISBN</FieldLabel>
                    <Input id="isbn" {...form.register('isbn')} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="publisher">Publisher</FieldLabel>
                    <Input id="publisher" {...form.register('publisher')} />
                  </Field>

                  <Controller
                    name="publishedYear"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Published year
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={1000}
                          max={2100}
                          value={numberInputValue(field.value)}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor="publishedPlace">
                      Published place
                    </FieldLabel>
                    <Input
                      id="publishedPlace"
                      {...form.register('publishedPlace')}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edition">Edition</FieldLabel>
                    <Input id="edition" {...form.register('edition')} />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="language">Language</FieldLabel>
                    <Input id="language" {...form.register('language')} />
                  </Field>

                  <Controller
                    name="pages"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Pages</FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={1}
                          value={numberInputValue(field.value)}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor="shelfLocation">
                      Shelf location
                    </FieldLabel>
                    <Input
                      id="shelfLocation"
                      {...form.register('shelfLocation')}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="stockTotal"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Stock total</FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          value={numberInputValue(field.value)}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                          onBlur={field.onBlur}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor="stockAvailable">
                      Stock available
                    </FieldLabel>
                    <Input
                      id="stockAvailable"
                      value={data?.stockAvailable ?? 0}
                      readOnly
                      disabled
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    rows={4}
                    {...form.register('description')}
                  />
                </Field>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-book"
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

export { BookFormDialog };
export type { BookFormDialogPayload };
