import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ReportSummary } from '../types/report.type';

function ReportTopBooks({ data }: { data?: ReportSummary['topBooks'] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Total loans</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.length ? (
          data.map((book, index) => (
            <TableRow key={book.bookId}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.total}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-muted-foreground">
              No loans in this range.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export { ReportTopBooks };
