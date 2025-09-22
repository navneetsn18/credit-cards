'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, CreditCard, Store, Star } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  data: {
    cardName: string;
    platformName: string;
    rewardRate: string;
    description?: string;
    platformImageUrl?: string;
  };
  isLoading?: boolean;
  type: 'create' | 'update';
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  data,
  isLoading = false,
  type,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${type === 'create' ? 'bg-green-100' : 'bg-blue-100'}`}>
              <CheckCircle className={`h-5 w-5 ${type === 'create' ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Please review the details below before {type === 'create' ? 'adding' : 'updating'} this benefit.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Card Name */}
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Credit Card</label>
                  <p className="text-base font-semibold text-gray-900">{data.cardName}</p>
                </div>
              </div>

              {/* Platform */}
              <div className="flex items-center gap-3">
                <Store className="h-4 w-4 text-gray-500" />
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Platform</label>
                    <div className="flex items-center gap-2 mt-1">
                      {data.platformImageUrl && (
                        <img
                          src={data.platformImageUrl}
                          alt={data.platformName}
                          className="w-5 h-5 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <Badge variant="secondary" className="text-sm">
                        {data.platformName}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reward Rate */}
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <label className="text-sm font-medium text-gray-700">Reward Rate</label>
                  <p className="text-base font-semibold text-green-600">{data.rewardRate}</p>
                </div>
              </div>

              {/* Description */}
              {data.description && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600 mt-1">{data.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${
              type === 'create' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {type === 'create' ? 'Adding...' : 'Updating...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm {type === 'create' ? 'Add' : 'Update'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}