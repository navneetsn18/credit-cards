'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';

interface VisitorStats {
  totalUniqueVisitors: number;
  totalVisits: number;
}

export default function VisitorCounter() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Track this visit
        await fetch('/api/visitors', {
          method: 'POST',
        });

        // Get updated stats
        const response = await fetch('/api/visitors');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackVisitor();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-2 sm:p-3 shadow-lg max-w-xs sm:max-w-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          <span className="text-muted-foreground hidden sm:inline">Unique Visitors:</span>
          <span className="text-muted-foreground sm:hidden">Visitors:</span>
          <Badge variant="secondary" className="font-mono text-xs">
            {stats.totalUniqueVisitors.toLocaleString()}
          </Badge>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          <span className="text-muted-foreground hidden sm:inline">Total Visits:</span>
          <span className="text-muted-foreground sm:hidden">Visits:</span>
          <Badge variant="secondary" className="font-mono text-xs">
            {stats.totalVisits.toLocaleString()}
          </Badge>
        </div>
      </div>
    </div>
  );
}