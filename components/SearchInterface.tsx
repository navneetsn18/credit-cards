'use client';

import { useState, useMemo, useEffect } from 'react';
import { ICardPlatform } from '@/lib/models/Card';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, CreditCard, Store, Filter, TrendingUp } from 'lucide-react';
import VisitorCounter from './VisitorCounter';
import { useCachedCardNames } from '@/hooks/useCachedApi';

interface SearchInterfaceProps {
  cards: ICardPlatform[];
  onRefresh?: () => void;
  isStale?: boolean;
  isLoading?: boolean;
}

interface CardWithImages {
  _id: string;
  cardName: string;
  platformName: string;
  platformImageUrl?: string;
  rewardRate: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  cardImageUrl?: string;
}

interface UniqueCard {
  name: string;
  imageUrl?: string;
  platformCount: number;
  bestReward: string;
}

interface UniquePlatform {
  name: string;
  imageUrl?: string;
  cardCount: number;
  bestReward: string;
}

export default function SearchInterface({ cards }: SearchInterfaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cardsWithImages, setCardsWithImages] = useState<CardWithImages[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch card images from the cards collection using cached API
  const { data: cardNamesData } = useCachedCardNames();

  // Process card images when data changes
  useEffect(() => {
    if (cardNamesData && Array.isArray(cardNamesData)) {
      const cardImages = cardNamesData.reduce((acc: Record<string, string>, card: { name: string; imageUrl?: string }) => {
        if (card.imageUrl) {
          acc[card.name] = card.imageUrl;
        }
        return acc;
      }, {});

      const enrichedCards: CardWithImages[] = cards.map(card => ({
        _id: card._id,
        cardName: card.cardName,
        platformName: card.platformName,
        platformImageUrl: card.platformImageUrl,
        rewardRate: card.rewardRate,
        description: card.description,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
        cardImageUrl: cardImages[card.cardName] || undefined,
      }));

      setCardsWithImages(enrichedCards);
    } else {
      // Fallback when no card names data is available
      const plainCards: CardWithImages[] = cards.map(card => ({
        _id: card._id,
        cardName: card.cardName,
        platformName: card.platformName,
        platformImageUrl: card.platformImageUrl,
        rewardRate: card.rewardRate,
        description: card.description,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      }));
      setCardsWithImages(plainCards);
    }
  }, [cards, cardNamesData]);

  // Get unique cards and platforms for filtering
  const uniqueCards = useMemo(() => {
    const cardMap = new Map();
    cardsWithImages.forEach(card => {
      if (!cardMap.has(card.cardName)) {
        cardMap.set(card.cardName, {
          name: card.cardName,
          imageUrl: card.cardImageUrl,
          platformCount: 0,
          bestReward: '',
        });
      }
      cardMap.get(card.cardName).platformCount++;
    });
    return Array.from(cardMap.values());
  }, [cardsWithImages]);

  const uniquePlatforms = useMemo(() => {
    const platformMap = new Map();
    cardsWithImages.forEach(card => {
      if (!platformMap.has(card.platformName)) {
        platformMap.set(card.platformName, {
          name: card.platformName,
          imageUrl: card.platformImageUrl,
          cardCount: 0,
          bestReward: '',
        });
      }
      platformMap.get(card.platformName).cardCount++;
    });
    return Array.from(platformMap.values());
  }, [cardsWithImages]);

  const filteredData = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    switch (activeTab) {
      case 'cards':
        if (!searchTerm.trim()) return uniqueCards;
        return uniqueCards.filter(card =>
          card.name.toLowerCase().includes(searchLower)
        );
      
      case 'platforms':
        if (!searchTerm.trim()) return uniquePlatforms;
        return uniquePlatforms.filter(platform =>
          platform.name.toLowerCase().includes(searchLower)
        );
      
      default: // 'all'
        if (!searchTerm.trim()) return cardsWithImages;
        return cardsWithImages.filter((card) =>
          card.platformName.toLowerCase().includes(searchLower) ||
          card.cardName.toLowerCase().includes(searchLower)
        );
    }
  }, [cardsWithImages, uniqueCards, uniquePlatforms, searchTerm, activeTab]);

  const getCardsForPlatform = (platformName: string) => {
    return cardsWithImages.filter(card => card.platformName === platformName);
  };

  const getPlatformsForCard = (cardName: string) => {
    return cardsWithImages.filter(card => card.cardName === cardName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
              Credit Card Benefits Tracker
            </h1>
            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90 px-4">
              Find the best rewards for your purchases
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={
                    activeTab === 'cards' ? "Search credit cards..." :
                    activeTab === 'platforms' ? "Search platforms..." :
                    "Search by platform or card name..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-6 text-lg text-gray-900 bg-white rounded-full shadow-lg border-0 focus:ring-4 focus:ring-blue-300"
                />
              </div>
              
              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
                  <TabsTrigger value="all" className="text-white data-[state=active]:text-gray-900 text-xs sm:text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">All Results</span>
                    <span className="sm:hidden">All</span>
                  </TabsTrigger>
                  <TabsTrigger value="cards" className="text-white data-[state=active]:text-gray-900 text-xs sm:text-sm">
                    <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">By Cards</span>
                    <span className="sm:hidden">Cards</span>
                  </TabsTrigger>
                  <TabsTrigger value="platforms" className="text-white data-[state=active]:text-gray-900 text-xs sm:text-sm">
                    <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">By Platforms</span>
                    <span className="sm:hidden">Platforms</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            {searchTerm ? `Search Results for "${searchTerm}"` : 
             activeTab === 'cards' ? 'All Credit Cards' :
             activeTab === 'platforms' ? 'All Platforms' :
             'All Benefits'}
          </h2>
          <p className="text-gray-600">
            {filteredData.length} {
              activeTab === 'cards' ? (filteredData.length === 1 ? 'card' : 'cards') :
              activeTab === 'platforms' ? (filteredData.length === 1 ? 'platform' : 'platforms') :
              (filteredData.length === 1 ? 'result' : 'results')
            } found
          </p>
        </div>

        {/* Results Grid */}
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {activeTab === 'cards' ? (
              // Card View - Show platforms for each card
              (filteredData as UniqueCard[]).map((cardData) => (
                <Card
                  key={cardData.name}
                  className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        {cardData.imageUrl ? (
                          <img
                            src={cardData.imageUrl}
                            alt={cardData.name}
                            className="w-10 h-6 sm:w-12 sm:h-8 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
                          {cardData.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {cardData.platformCount} platform{cardData.platformCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getPlatformsForCard(cardData.name).map((platform, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {platform.platformImageUrl ? (
                                <img
                                  src={platform.platformImageUrl}
                                  alt={platform.platformName}
                                  className="w-4 h-4 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Store className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium break-words leading-tight flex-1">{platform.platformName}</span>
                          </div>
                          <div className="flex justify-end">
                            <Badge variant="outline" className="text-xs break-words text-center leading-tight whitespace-normal">
                              {platform.rewardRate}
                            </Badge>
                          </div>
                          {platform.description && (
                            <div className="pt-1 border-t border-gray-200">
                              <p className="text-xs text-gray-600 break-words leading-tight">
                                {platform.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : activeTab === 'platforms' ? (
              // Platform View - Show cards for each platform
              (filteredData as UniquePlatform[]).map((platformData) => (
                <Card
                  key={platformData.name}
                  className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        {platformData.imageUrl ? (
                          <img
                            src={platformData.imageUrl}
                            alt={platformData.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded flex items-center justify-center">
                            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight">
                          {platformData.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {platformData.cardCount} card{platformData.cardCount !== 1 ? 's' : ''} available
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getCardsForPlatform(platformData.name)
                        .sort((a, b) => {
                          // Sort by reward rate (try to extract numbers for better sorting)
                          const aNum = parseFloat(a.rewardRate.match(/[\d.]+/)?.[0] || '0');
                          const bNum = parseFloat(b.rewardRate.match(/[\d.]+/)?.[0] || '0');
                          return bNum - aNum;
                        })
                        .map((card, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {card.cardImageUrl ? (
                                <img
                                  src={card.cardImageUrl}
                                  alt={card.cardName}
                                  className="w-5 h-3 sm:w-6 sm:h-4 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <CreditCard className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                            <span className="text-xs sm:text-sm font-medium break-words leading-tight flex-1">{card.cardName}</span>
                            {index === 0 && (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800 flex-shrink-0">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Best
                              </Badge>
                            )}
                          </div>
                          <div className="flex justify-end">
                            <Badge variant="outline" className="text-xs font-semibold text-green-600 break-words text-center leading-tight whitespace-normal">
                              {card.rewardRate}
                            </Badge>
                          </div>
                          {card.description && (
                            <div className="pt-1 border-t border-gray-200">
                              <p className="text-xs text-gray-600 break-words leading-tight">
                                {card.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // All View - Original card display
              (filteredData as CardWithImages[]).map((card) => (
                <Card
                  key={card._id}
                  className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        {card.cardImageUrl ? (
                          <img
                            src={card.cardImageUrl}
                            alt={card.cardName}
                            className="w-10 h-6 sm:w-12 sm:h-8 object-cover rounded border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-6 sm:w-12 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words leading-tight mb-2">
                          {card.cardName}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-shrink-0">
                            {card.platformImageUrl ? (
                              <img
                                src={card.platformImageUrl}
                                alt={card.platformName}
                                className="w-5 h-5 sm:w-6 sm:h-6 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Store className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs sm:text-sm break-words text-center leading-tight">
                            {card.platformName}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="mb-1">
                        <div className="text-lg sm:text-xl font-bold text-green-600 break-words leading-tight">
                          {card.rewardRate}
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">Reward Rate</div>
                    </div>

                    {card.description && (
                      <div className="border-t pt-3">
                        <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {card.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No cards found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? `No ${activeTab === 'cards' ? 'cards' : activeTab === 'platforms' ? 'platforms' : 'results'} match your search for "${searchTerm}". Try a different search term.`
                    : `No ${activeTab === 'cards' ? 'credit cards' : activeTab === 'platforms' ? 'platforms' : 'data'} available yet. Add some cards to get started.`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Visitor Counter */}
      <VisitorCounter />
    </div>
  );
}