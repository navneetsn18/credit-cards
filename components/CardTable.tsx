'use client';

import { useState, useEffect } from 'react';
import { ICardPlatform } from '@/lib/models/Card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Check, X, CreditCard, Store, Loader2 } from 'lucide-react';

interface CardTableProps {
  cards: ICardPlatform[];
  onEdit: (card: ICardPlatform) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
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

export default function CardTable({ cards, onEdit, onDelete, isLoading = false, readOnly = false }: CardTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cardsWithImages, setCardsWithImages] = useState<CardWithImages[]>([]);

  // Fetch card images from the cards collection
  useEffect(() => {
    const fetchCardImages = async () => {
      try {
        const response = await fetch('/api/cards/names');
        const data = await response.json();
        
        if (data.success) {
          const cardImages = data.data.reduce((acc: Record<string, string>, card: { name: string; imageUrl?: string }) => {
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
      } catch (error) {
        console.error('Error fetching card images:', error);
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
    };

    fetchCardImages();
  }, [cards]);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id);
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (cardsWithImages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No benefits added yet</h3>
            <p className="text-gray-600">Add your first platform benefit to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          All Benefits ({cardsWithImages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reward Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cardsWithImages.map((card) => (
                <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {card.cardImageUrl ? (
                        <img
                          src={card.cardImageUrl}
                          alt={card.cardName}
                          className="w-8 h-5 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                          <CreditCard className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{card.cardName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {card.platformImageUrl ? (
                        <img
                          src={card.platformImageUrl}
                          alt={card.platformName}
                          className="w-5 h-5 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Store className="h-4 w-4 text-gray-400" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {card.platformName}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-600">{card.rewardRate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-xs truncate">
                      {card.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {!readOnly ? (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(card as ICardPlatform)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {deleteConfirm === card._id ? (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConfirm(card._id)}
                              disabled={deletingId === card._id}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              {deletingId === card._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDeleteCancel}
                              disabled={deletingId === card._id}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(card._id)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}