'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import CardForm from '@/components/CardForm';
import CardTable from '@/components/CardTable';
import AddCardForm from '@/components/AddCardForm';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICardPlatform } from '@/lib/models/Card';
import { ArrowLeft, Settings } from 'lucide-react';

export default function ManagePage() {
  const [cards, setCards] = useState<ICardPlatform[]>([]);
  const [editingCard, setEditingCard] = useState<ICardPlatform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cards');
      const result = await response.json();
      
      if (result.success) {
        setCards(result.data || []);
      } else {
        // Show more specific error message for authentication issues
        if (result.error === 'Database authentication failed') {
          showMessage('error', 'Database connection failed. Please check MongoDB credentials.');
        } else {
          showMessage('error', result.message || 'Failed to fetch cards');
        }
        setCards([]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      showMessage('error', 'Failed to fetch cards');
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateCard = async (data: Partial<ICardPlatform>) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setCards([...cards, result.data]);
        showMessage('success', 'Benefits added successfully!');
      } else {
        showMessage('error', result.message || 'Failed to add benefits');
      }
    } catch (error) {
      console.error('Error creating card:', error);
      showMessage('error', 'Failed to add benefits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCard = async (data: Partial<ICardPlatform>) => {
    if (!editingCard) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cards/${editingCard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setCards(cards.map(card => 
          card._id === editingCard._id ? result.data : card
        ));
        setEditingCard(null);
        showMessage('success', 'Benefits updated successfully!');
      } else {
        showMessage('error', result.message || 'Failed to update benefits');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      showMessage('error', 'Failed to update benefits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCards(cards.filter(card => card._id !== id));
        showMessage('success', 'Benefits deleted successfully!');
      } else {
        showMessage('error', result.message || 'Failed to delete benefits');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      showMessage('error', 'Failed to delete benefits');
    }
  };

  const handleEditCard = (card: ICardPlatform) => {
    setEditingCard(card);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const handleCardAdded = () => {
    // Refresh the cards list when a new card is added
    // This will update the dropdown in the benefits form
    showMessage('success', 'Card added successfully! You can now add benefits for this card.');
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-xl">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-lg">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Manage Credit Cards
                </h1>
                <p className="text-lg opacity-90">
                  Add cards and manage their platform-specific benefits
                </p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className="container mx-auto px-4 pt-6">
          <Alert className={`${
            message.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <AlertDescription className={`${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="add-cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="add-cards">Add Cards</TabsTrigger>
            <TabsTrigger value="manage-benefits">Manage Benefits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-cards" className="space-y-6">
            <div className="max-w-md mx-auto">
              <AddCardForm onCardAdded={handleCardAdded} />
            </div>
          </TabsContent>
          
          <TabsContent value="manage-benefits" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Form Section */}
              <div>
                <CardForm
                  onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
                  onCancel={editingCard ? handleCancelEdit : undefined}
                  initialData={editingCard || undefined}
                  isEditing={!!editingCard}
                  isLoading={isLoading}
                />
              </div>

              {/* Table Section */}
              <div>
                <CardTable
                  cards={cards}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}