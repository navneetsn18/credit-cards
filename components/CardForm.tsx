'use client';

import { useState, useEffect } from 'react';
import { ICardPlatform } from '@/lib/models/Card';
import CardDropdown from './CardDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Store, Image, Percent, FileText } from 'lucide-react';

interface CardFormProps {
  onSubmit: (data: Partial<ICardPlatform>) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ICardPlatform>;
  isEditing?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function CardForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isLoading = false,
  disabled = false,
}: CardFormProps) {
  const [formData, setFormData] = useState({
    cardName: '',
    platformName: '',
    platformImageUrl: '',
    rewardRate: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        cardName: initialData.cardName || '',
        platformName: initialData.platformName || '',
        platformImageUrl: initialData.platformImageUrl || '',
        rewardRate: initialData.rewardRate || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Card name is required';
    } else if (formData.cardName.length > 100) {
      newErrors.cardName = 'Card name cannot exceed 100 characters';
    }

    if (!formData.platformName.trim()) {
      newErrors.platformName = 'Platform name is required';
    } else if (formData.platformName.length > 50) {
      newErrors.platformName = 'Platform name cannot exceed 50 characters';
    }

    if (!formData.rewardRate.trim()) {
      newErrors.rewardRate = 'Reward rate is required';
    } else if (formData.rewardRate.length > 200) {
      newErrors.rewardRate = 'Reward rate cannot exceed 200 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.platformImageUrl && formData.platformImageUrl.length > 500) {
      newErrors.platformImageUrl = 'Platform image URL cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      if (!isEditing) {
        // Reset form after successful creation
        setFormData({
          cardName: '',
          platformName: '',
          platformImageUrl: '',
          rewardRate: '',
          description: '',
        });
      }
      setErrors({});
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCancel = () => {
    setFormData({
      cardName: '',
      platformName: '',
      platformImageUrl: '',
      rewardRate: '',
      description: '',
    });
    setErrors({});
    onCancel?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Store className="h-5 w-5" />
          {isEditing ? 'Edit Benefits' : 'Add Platform Benefits'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update the platform-specific benefits' : 'Add benefits for a specific platform or merchant'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="cardName">Card Name *</Label>
            <CardDropdown
              value={formData.cardName}
              onChange={(cardName) => {
                setFormData((prev) => ({ ...prev, cardName }));
                if (errors.cardName) {
                  setErrors((prev) => ({ ...prev, cardName: '' }));
                }
              }}
              placeholder="Select a card"
              disabled={disabled || isLoading}
            />
            {errors.cardName && (
              <p className="text-sm text-red-600">{errors.cardName}</p>
            )}
          </div>

          {/* Platform Name */}
          <div className="space-y-2">
            <Label htmlFor="platformName" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Platform Name *
            </Label>
            <Input
              id="platformName"
              name="platformName"
              type="text"
              placeholder="e.g., Amazon, Flipkart, Offline"
              value={formData.platformName}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className={`text-gray-900 bg-white ${errors.platformName ? 'border-red-500' : ''}`}
            />
            {errors.platformName && (
              <p className="text-sm text-red-600">{errors.platformName}</p>
            )}
          </div>

          {/* Platform Image URL */}
          <div className="space-y-2">
            <Label htmlFor="platformImageUrl" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Platform Image URL (Optional)
            </Label>
            <Input
              id="platformImageUrl"
              name="platformImageUrl"
              type="url"
              placeholder="https://example.com/platform-logo.jpg"
              value={formData.platformImageUrl}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className={`text-gray-900 bg-white ${errors.platformImageUrl ? 'border-red-500' : ''}`}
            />
            {formData.platformImageUrl && (
              <div className="mt-2">
                <img
                  src={formData.platformImageUrl}
                  alt="Platform preview"
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            {errors.platformImageUrl && (
              <p className="text-sm text-red-600">{errors.platformImageUrl}</p>
            )}
          </div>

          {/* Reward Rate */}
          <div className="space-y-2">
            <Label htmlFor="rewardRate" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Reward Rate *
            </Label>
            <Input
              id="rewardRate"
              name="rewardRate"
              type="text"
              placeholder="e.g., 2% cashback, 5x points, 10% up to ₹500"
              value={formData.rewardRate}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className={`text-gray-900 bg-white ${errors.rewardRate ? 'border-red-500' : ''}`}
            />
            {errors.rewardRate && (
              <p className="text-sm text-red-600">{errors.rewardRate}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Add notes about caps, milestones, or redemption options..."
              value={formData.description}
              onChange={handleInputChange}
              disabled={disabled || isLoading}
              className={`text-gray-900 bg-white resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={disabled || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Update Benefits' : 'Add Benefits'
              )}
            </Button>
            
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={disabled || isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}