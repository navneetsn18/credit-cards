'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { browserCache } from '@/lib/cache';
import { Trash2, RefreshCw, Database, Clock } from 'lucide-react';

export default function CacheStatus() {
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    expired: 0,
    keys: [] as string[],
  });

  const updateStats = () => {
    setStats(browserCache.getStats());
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    browserCache.clear();
    updateStats();
  };

  const formatCacheKey = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">{stats.valid}</div>
            <div className="text-xs text-gray-500">Valid</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{stats.expired}</div>
            <div className="text-xs text-gray-500">Expired</div>
          </div>
        </div>

        {stats.keys.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700">Cached Items:</div>
            <div className="flex flex-wrap gap-1">
              {stats.keys.map((key) => (
                <Badge key={key} variant="outline" className="text-xs">
                  {formatCacheKey(key)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={updateStats}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Auto-updates every second
        </div>
      </CardContent>
    </Card>
  );
}