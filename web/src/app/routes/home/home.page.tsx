import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Page } from '@/components/shared/page';
// import authStore from '@/stores/auth.store';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Find a book',
    body: 'Search by title, author, or ISBN. Category and stock status sit on every result.',
  },
  {
    number: '02',
    title: 'Borrow at the desk',
    body: 'Staff log the loan and set the due date. Your loan list keeps the return date in view.',
  },
  {
    number: '03',
    title: 'Keep the shelf current',
    body: 'Stock changes as books move. Staff reports show what is out and what is overdue.',
  },
];

const HomePage = () => {
  // const authenticated = authStore((s) => s.status) === 'authenticated';

  return (
    <Page className="min-h-svh">
      <section className="w-full">
        <div className="container grid gap-12 px-4 py-12 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="typo-overline text-muted-foreground">
              Library catalog
            </p>
            <h1 className="mt-4 max-w-2xl typo-heading-xl">
              Find a book. Borrow it. Bring it back.
            </h1>
            <p className="mt-6 max-w-xl typo-lead">
              Search the catalog, check what is on the shelf, and follow every
              loan from pickup to return.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/catalog">Browse catalog</Link>
              </Button>
              {/* {authenticated && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/loans">My loans</Link>
                </Button>
              )} */}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-3 rotate-2 rounded-3xl bg-primary/10" />
            <Card className="relative -rotate-1 shadow-xl">
              <CardHeader>
                <p className="typo-overline text-muted-foreground">
                  On the shelf
                </p>
                <CardTitle className="typo-heading-md">
                  Search, borrow, return
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className="flex gap-4 border-t border-border/60 pt-4 first:border-0 first:pt-0"
                  >
                    <span className="typo-caption text-muted-foreground">
                      {step.number}
                    </span>
                    <div>
                      <p className="typo-heading-xs">{step.title}</p>
                      <p className="typo-body-sm text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-border/60">
        <div className="container px-4 py-12 md:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number}>
                <p className="typo-overline text-muted-foreground">
                  {step.number}
                </p>
                <h2 className="mt-3 typo-heading-sm">{step.title}</h2>
                <p className="mt-2 typo-body-md text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
};

export default HomePage;
