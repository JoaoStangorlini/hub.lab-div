import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomeClientView } from '@/components/HomeClientView';
import { MediaCardProps } from '@/components/MediaCard';
import { supabase } from '@/lib/supabase';

// Helper to ensure stability before we have real data
export const revalidate = 0;

export default async function Home() {
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('status', 'aprovado')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
  }

  const items: MediaCardProps[] = submissions?.map(sub => ({
    id: sub.id,
    title: sub.title,
    description: sub.description,
    authors: sub.authors,
    mediaType: sub.media_type,
    mediaUrl: sub.media_url,
    category: sub.category,
    isFeatured: sub.featured,
  })) || [];

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-gray-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">
        <HomeClientView initialItems={items} />
      </main>
      <Footer />
    </div>
  );
}
