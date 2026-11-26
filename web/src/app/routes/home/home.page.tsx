import { Button } from '@/components/ui/button';
import { Page, PageSection } from '@/components/shared/page';
// import authStore from '@/stores/auth.store';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { Link } from 'react-router-dom';

const HomePage = () => {
  // const authenticated = authStore((s) => s.status) === 'authenticated';

  return (
    <Page className="min-h-svh">
      <PageSection className="items-center py-24 text-center">
        <h1 className="typo-display">
          Discover New Stories <br /> Through{' '}
          <TypingAnimation
            className="text-primary"
            words={[
              'Favorite Books',
              'Magical Worlds',
              'New Adventures',
              'Endless Knowledge',
              'Imagination',
            ]}
            loop
          />
        </h1>
        <p className="mb-8 max-w-sm typo-body-md text-muted-foreground">
          Explore book collections, discover your next favorite read, and enjoy
          a delightful digital library experience.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="lg" asChild>
            <Link to="/catalog">Browse catalog</Link>
          </Button>
          {/* {authenticated && (
                <Button size="lg" variant="outline" asChild>
                  <Link to="/loans">My loans</Link>
                </Button>
              )} */}
        </div>
      </PageSection>
    </Page>
  );
};

export default HomePage;
