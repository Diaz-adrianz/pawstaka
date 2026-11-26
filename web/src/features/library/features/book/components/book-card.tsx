import { ImgPlaceholder } from '@/assets/images';
import type { Book } from '../types/book.type';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function BookCard({
  book,
  onViewClick,
}: {
  book: Pick<
    Book,
    'id' | 'title' | 'author' | 'coverUrl' | 'stockAvailable' | 'publishedYear'
  > & {
    category?: Pick<NonNullable<Book['category']>, 'name'>;
  };
} & { onViewClick?: () => void }) {
  return (
    <Card key={book.id} className="pt-0" size="sm">
      <div className="relative mx-auto aspect-3/4 w-full">
        <img
          src={book.coverUrl ?? ImgPlaceholder}
          alt={'Cover of ' + book.title}
          className="size-full object-cover"
        />
        <Badge
          className="absolute top-2 right-2"
          variant={
            book.stockAvailable === 0
              ? 'destructive'
              : book.stockAvailable <= 3
                ? 'warning'
                : 'success'
          }
        >
          {book.stockAvailable === 0
            ? 'Out of stock'
            : book.stockAvailable <= 3
              ? 'Low stock'
              : 'Available'}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{book.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {book.author}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full flex-wrap items-end gap-2">
        {book.category?.name && (
          <Badge variant={'secondary'}>{book.category?.name}</Badge>
        )}
        {book.publishedYear && (
          <Badge variant={'secondary'}>{book.publishedYear}</Badge>
        )}
      </CardContent>
      {onViewClick && (
        <CardFooter>
          <Button
            className="w-full"
            size={'xs'}
            variant={'outline'}
            onClick={onViewClick}
          >
            View
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export { BookCard };
