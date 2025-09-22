'use client';

import SearchInterface from '@/components/SearchInterface';
import { ICardPlatform } from '@/lib/models/Card';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Loader2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useCachedCards } from '@/hooks/useCachedApi';

export default function Home() {
  const permissions = usePermissions();
  const { data: cards, loading, error, refresh, isStale } = useCachedCards();

  if (permissions.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h3>
            <p className="text-gray-600">
              Checking permissions and loading data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!permissions.read) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading Benefits...
            </h3>
            <p className="text-gray-600">
              Fetching the latest credit card benefits data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Data
            </h3>
            <p className="text-gray-600">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <SearchInterface cards={(cards as ICardPlatform[]) || []} />;
}
