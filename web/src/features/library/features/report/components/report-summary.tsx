import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReportSummary } from '../types/report.type';

function ReportSummaryCards({ data }: { data?: ReportSummary }) {
  const items = [
    { label: 'Total titles', value: data?.books.totalTitles },
    { label: 'Total stock', value: data?.books.totalStock },
    { label: 'Available stock', value: data?.books.availableStock },
    { label: 'Total members', value: data?.members.total },
    { label: 'Active loans', value: data?.loans.active },
    { label: 'Overdue loans', value: data?.loans.overdue },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{item.value ?? 0}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { ReportSummaryCards };
