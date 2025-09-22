import SearchInterface from '@/components/SearchInterface';
import connectDB from '@/lib/mongodb';
import CardPlatform, { ICardPlatform } from '@/lib/models/Card';
import { canRead } from '@/lib/permissions';
import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

type PlainCardPlatform = {
  _id: string;
  cardName: string;
  platformName: string;
  platformImageUrl?: string;
  rewardRate: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getCards(): Promise<PlainCardPlatform[]> {
  try {
    if (!canRead()) {
      return [];
    }

    await connectDB();
    
    const cards = await CardPlatform.find({})
      .sort({ rewardRate: -1, cardName: 1 })
      .lean();

    // Convert MongoDB documents to plain objects
    return cards.map(card => ({
      _id: String(card._id),
      cardName: card.cardName,
      platformName: card.platformName,
      platformImageUrl: card.platformImageUrl,
      rewardRate: card.rewardRate,
      description: card.description,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
}

export default async function Home() {
  if (!canRead()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Access Restricted
            </h3>
            <p className="text-gray-600">
              Read access is currently disabled. Please contact the administrator for access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = await getCards();

  return <SearchInterface cards={cards as ICardPlatform[]} />;
}