import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeClientView } from '@/components/HomeClientView';
import { fetchSubmissions } from '@/app/actions/submissions';

// Helper to ensure stability before we have real data
export const revalidate = 0;

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const initialCategory = params.category || 'Todos';

  // Fetch initial page 1
  const { items: initialItems, hasMore: initialHasMore } = await fetchSubmissions({
    page: 1,
    limit: 12, // Starting with 12 items initially
    query: '',
    categories: [initialCategory],
    sort: 'recentes'
  });

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <HomeClientView
          initialItems={initialItems}
          initialHasMore={initialHasMore}
          initialCategory={initialCategory}
        />
      </main>
      <Footer />
    </div>
  );
}
