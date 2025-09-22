import SearchInterface from '@/components/SearchInterface';

async function getCards() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cards`, {
      cache: 'no-store',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.warn('API returned error:', result.message);
      return [];
    }
    
    return result.data || [];
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export default async function Home() {
  const cards = await getCards();

  return <SearchInterface cards={cards} />;
}