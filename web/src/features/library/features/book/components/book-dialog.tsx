import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { DialogState } from '@/hooks/use-dialog';
import { useBook } from '../api/book.query';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundResourceEmpty } from '@/components/shared/not-found-empty';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { ImgPlaceholder } from '@/assets/images';
import { cn } from 'cn';

type BookDialogPayload = { id: string };

function BookDialog({
  open,
  onOpenChange,
  payload,
}: DialogState<BookDialogPayload>) {
  const { data, isLoading } = useBook(payload?.id ?? '', {
    enabled: !!payload?.id && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>Book Detail</DialogTitle>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4">
          {!data ? (
            <NotFoundResourceEmpty resource="Book" />
          ) : (
            <>
              <div className="mx-auto mb-4 aspect-3/4 w-full max-w-40 overflow-hidden rounded-2xl">
                <img
                  src={data.coverUrl ?? ImgPlaceholder}
                  alt={'Cover of ' + data.title}
                  className="size-full object-cover"
                />
              </div>

              <div className="mb-8 text-center">
                <h2 className="typo-heading-md">{data.title}</h2>
                {data.subtitle && (
                  <p className="mb-2 typo-caption text-primary italic">
                    {data.subtitle}
                  </p>
                )}
                <p className="typo-body-md text-muted-foreground">
                  {data.author}
                </p>
              </div>

              {data.description && (
                <p className="mb-8 text-center text-muted-foreground">
                  {data.description}
                </p>
              )}

              <ItemGroup className="mb-4 flex-row">
                <Item variant={'muted'}>
                  <ItemContent className="items-center">
                    <ItemTitle className="text-2xl">
                      {data.stockTotal}
                    </ItemTitle>
                    <ItemDescription>Jumlah</ItemDescription>
                  </ItemContent>
                </Item>
                <Item variant={'muted'}>
                  <ItemContent className="items-center">
                    <ItemTitle
                      className={cn(
                        'text-2xl',
                        data.stockAvailable <= 0
                          ? 'text-destructive'
                          : data.stockAvailable <= 3
                            ? 'text-warning'
                            : ''
                      )}
                    >
                      {data.stockAvailable}
                    </ItemTitle>
                    <ItemDescription>Tersedia</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>

              <ItemGroup className="mb-4 rounded-2xl border py-2">
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Category</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.category?.name}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>ISBN</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.isbn}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Edition</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.edition}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Language</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.language}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Pages</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.pages}</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>

              <ItemGroup className="mb-4 rounded-2xl border py-2">
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Publisher</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.publisher}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Published year</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.publishedYear}</ItemDescription>
                  </ItemContent>
                </Item>
                <ItemSeparator className="m-0" />
                <Item size={'xs'}>
                  <ItemContent>
                    <ItemTitle>Published place</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemDescription>{data.publishedPlace}</ItemDescription>
                  </ItemContent>
                </Item>
              </ItemGroup>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { BookDialog };
export type { BookDialogPayload };
