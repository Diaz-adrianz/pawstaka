import type { DialogState } from '@/hooks/use-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useRef, useState } from 'react';
import {
  BOOK_COVER_MAX_SIZE,
  BOOK_COVER_MIME_TYPES,
  updateBookSchema,
  type UpdateBookValues,
} from '../schemas/book.schema';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUpdateBook } from '../api/book.mutation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CategoryComboboxSingle } from '../../category';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useBook } from '../api/book.query';
import { NotFoundResourceEmpty } from '@/components/shared/not-found-empty';
import { useUpload } from '@/features/storage';
import { LoadingOverlay } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { RiAddLine } from '@remixicon/react';

type BookUpdateDialogPayload = { id: string };

function BookUpdateDialog({
  open,
  onOpenChange,
  hide,
  payload,
}: DialogState<BookUpdateDialogPayload>) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const coverUpload = useUpload({
      mimeTypes: BOOK_COVER_MIME_TYPES,
      maxSize: BOOK_COVER_MAX_SIZE,
    }),
    coverInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useBook(payload?.id ?? '', {
      enabled: !!payload?.id && open,
    }),
    updateApi = useUpdateBook({
      onSuccess() {
        hide();
        coverUpload.reset();
      },
    });

  const form = useForm<UpdateBookValues>({
    resolver: yupResolver(updateBookSchema),
    mode: 'onChange',
    values: data && {
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
      isbn: data.isbn,
      publisher: data.publisher,
      publishedYear: data.publishedYear,
      publishedPlace: data.publishedPlace,
      edition: data.edition,
      language: data.language,
      pages: data.pages,
      description: data.description,
      shelfLocation: data.shelfLocation,
      category: data.category,
    },
  });

  const update = async ({ category, ...values }: UpdateBookValues) => {
    if (data) {
      let cover = undefined;

      if (coverUpload.file) {
        cover = await coverUpload.submit();
        if (cover == null) return;
      }

      toast.promise(
        updateApi.mutateAsync({
          id: data.id,
          data: { ...values, cover, categoryId: category?.id },
        }),
        { loading: 'Editing book...', success: 'Book edited' }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={setContainer} className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Book</DialogTitle>
        </DialogHeader>

        {!data && !isLoading && open ? (
          <NotFoundResourceEmpty resource="Book" />
        ) : (
          <>
            <form
              id="form-book-update"
              onSubmit={form.handleSubmit(update)}
              className="-mx-4 no-scrollbar max-h-[60vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <button
                  type="button"
                  className="relative mx-auto mb-4 aspect-3/4 w-full max-w-40 overflow-hidden rounded-2xl border"
                  disabled={coverUpload.isLoading}
                  onClick={() => coverInputRef.current?.click()}
                >
                  {coverUpload.isLoading && <LoadingOverlay />}
                  {coverUpload.preview || data?.coverUrl ? (
                    <img
                      src={coverUpload.preview ?? data?.coverUrl ?? ''}
                      alt="Cover preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <Badge variant={'ghost'} className="m-auto">
                      <RiAddLine /> Cover
                    </Badge>
                  )}
                </button>

                <input
                  ref={coverInputRef}
                  type="file"
                  accept={BOOK_COVER_MIME_TYPES.join(',')}
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file) coverUpload.select(file);
                  }}
                />

                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="subtitle"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Subtitle</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
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
                    name="author"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Author</FieldLabel>
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
                </div>

                <Controller
                  name="category"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <CategoryComboboxSingle
                        container={container}
                        id={field.name}
                        value={field.value ?? null}
                        onValueChange={field.onChange}
                        invalid={fieldState.invalid}
                        onBlur={field.onBlur}
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
                        rows={4}
                        value={field.value ?? ''}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Separator />

                <Controller
                  name="shelfLocation"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Shelf</FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Separator />

                <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
                  <Controller
                    name="isbn"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>ISBN</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
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
                    name="edition"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Edition</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
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
                    name="language"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Language</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
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
                    name="pages"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Pages</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type="number"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="publisher"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Publisher</FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
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
                    name="publishedYear"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Published year
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          type="number"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="publishedPlace"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Published place
                        </FieldLabel>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-book-update"
                disabled={
                  !form.formState.isValid ||
                  updateApi.isPending ||
                  coverUpload.isLoading
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

export { BookUpdateDialog };
export type { BookUpdateDialogPayload };
