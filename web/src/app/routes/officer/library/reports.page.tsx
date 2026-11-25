import { useState } from 'react';
import {
  Page,
  PageHeader,
  PageNav,
  PageSection,
} from '@/components/shared/page';
import { DatePickerSingle } from '@/components/shared/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  ReportSummaryCards,
  ReportTopBooks,
  useReportSummary,
} from '@/features/library';
import { Can } from '@casl/react';

const ReportsPage = () => {
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);

  const { data } = useReportSummary({
    from: from ?? undefined,
    to: to ?? undefined,
  });

  return (
    <Page className="min-h-svh">
      <PageNav
        items={[
          { label: 'Dashboard', path: '/officer' },
          { label: 'Library' },
          { label: 'Reports' },
        ]}
      />
      <PageHeader title="Reports" />
      <PageSection>
        <Can I={'read'} a={'library:report'}>
          <div className="mb-6 flex flex-wrap gap-4">
            <Field className="w-48">
              <FieldLabel htmlFor="report-from">From</FieldLabel>
              <DatePickerSingle
                id="report-from"
                value={from}
                onValueChange={setFrom}
                placeholder="From date"
              />
            </Field>
            <Field className="w-48">
              <FieldLabel htmlFor="report-to">To</FieldLabel>
              <DatePickerSingle
                id="report-to"
                value={to}
                onValueChange={setTo}
                placeholder="To date"
              />
            </Field>
          </div>

          <ReportSummaryCards data={data} />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Top books</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTopBooks data={data?.topBooks} />
            </CardContent>
          </Card>
        </Can>
      </PageSection>
    </Page>
  );
};

export default ReportsPage;
