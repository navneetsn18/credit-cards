'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CardForm from '@/components/CardForm';
import CardTable from '@/components/CardTable';
import AddCardForm from '@/components/AddCardForm';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ICardPlatform } from '@/lib/models/Card';
import { ArrowLeft, Settings, Lock, Eye, Edit, Shield, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useCachedCards } from '@/hooks/useCachedApi';
import { browserCache, CACHE_KEYS } from '@/lib/cache';
import CacheStatus from '@/components/CacheStatus';

export default function ManagePage() {
  const router = useRouter();
  const [editingCard, setEditingCard] = useState<ICardPlatform | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const permissions = usePermissions();
  
  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);
  
  const handleError = useCallback((error: string) => {
    if (error.includes('Database authentication failed')) {
      showMessage('error', 'Database connection failed. Please check MongoDB credentials.');
    } else {
      showMessage('error', error);
    }
  }, [showMessage]);
  
  const {
    data: cards,
    loading: isLoading,
    refresh: refreshCards,
    isStale,
  } = useCachedCards({
    onError: handleError,
  });


  const handleCreateCard = async (data: Partial<ICardPlatform>) => {
    if (!permissions.write) {
      showMessage('error', 'Write access is disabled');
      return;
    }

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Clear all related caches and refresh data
        browserCache.delete(CACHE_KEYS.CARDS);
        browserCache.delete(CACHE_KEYS.CARD_NAMES);
        refreshCards();
        showMessage('success', 'Benefits added successfully!');
      } else {
        showMessage('error', result.message || 'Failed to add benefits');
      }
    } catch (error) {
      console.error('Error creating card:', error);
      showMessage('error', 'Failed to add benefits');
    }
  };

  const handleUpdateCard = async (data: Partial<ICardPlatform>) => {
    if (!editingCard) return;
    
    if (!permissions.write) {
      showMessage('error', 'Write access is disabled');
      return;
    }

    try {
      const response = await fetch(`/api/cards/${editingCard._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Clear all related caches and refresh data
        browserCache.delete(CACHE_KEYS.CARDS);
        browserCache.delete(CACHE_KEYS.CARD_NAMES);
        refreshCards();
        setEditingCard(null);
        showMessage('success', 'Benefits updated successfully!');
      } else {
        showMessage('error', result.message || 'Failed to update benefits');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      showMessage('error', 'Failed to update benefits');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!permissions.write) {
      showMessage('error', 'Write access is disabled');
      return;
    }

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Clear all related caches and refresh data
        browserCache.delete(CACHE_KEYS.CARDS);
        browserCache.delete(CACHE_KEYS.CARD_NAMES);
        refreshCards();
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
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="bg-white text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  console.log('Back to Search clicked');
                  try {
                    console.log('Trying router.push');
                    router.push('/');
                  } catch (error) {
                    console.log('Router failed, using window.location', error);
                    window.location.href = '/';
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              
              {/* Alternative Link as backup */}
              <Button asChild variant="outline" className="bg-white text-gray-700 hover:bg-gray-50">
                <Link href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
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

      {/* Permissions Status */}
      <div className="container mx-auto px-4 py-6">
        <Card className="bg-white/50 backdrop-blur-sm border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Access Permissions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <Badge variant={permissions.read ? "default" : "secondary"} className={permissions.read ? "bg-green-100 text-green-800" : ""}>
                    Read: {permissions.loading ? "..." : permissions.read ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <Badge variant={permissions.write ? "default" : "secondary"} className={permissions.write ? "bg-blue-100 text-blue-800" : ""}>
                    Write: {permissions.loading ? "..." : permissions.write ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={isStale ? "destructive" : "outline"} className="text-xs">
                    Cache: {isStale ? "Stale" : "Fresh"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refreshCards()}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                    title="Refresh data"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
            {!permissions.write && !permissions.loading && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Write access is disabled. You can view data but cannot add, edit, or delete records.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="add-cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="add-cards">Add Cards</TabsTrigger>
            <TabsTrigger value="manage-benefits">Manage Benefits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-cards" className="space-y-6">
            <AddCardForm onCardAdded={handleCardAdded} disabled={!permissions.write} />
          </TabsContent>
          
          <TabsContent value="manage-benefits" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Form Section */}
              <div>
                <CardForm
                  onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
                  onCancel={editingCard ? handleCancelEdit : undefined}
                  initialData={editingCard || undefined}
                  isEditing={!!editingCard}
                  isLoading={isLoading}
                  disabled={!permissions.write}
                />
                
                {/* Cache Status */}
                <div className="mt-6">
                  <CacheStatus />
                </div>
              </div>

              {/* Table Section */}
              <div className="xl:col-span-2">
                <CardTable
                  cards={(cards as ICardPlatform[]) || []}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                  isLoading={isLoading}
                  readOnly={!permissions.write}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}