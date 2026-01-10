'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { marketplaceService, type PremiumStoryPricing } from '@/services/marketplaceService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface StoryPricingManagerProps {
  storyId: string;
  onPricingUpdated?: () => void;
  className?: string;
}

export function StoryPricingManager({
  storyId,
  onPricingUpdated,
  className = '',
}: StoryPricingManagerProps) {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<PremiumStoryPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    pricingModel: 'one_time' as 'one_time' | 'chapter_based' | 'subscription' | 'free_with_ads',
    priceAmount: '0',
    chapterPrice: '0',
    freeChapters: '0',
    subscriptionDurationDays: '30',
    discountPercentage: '0',
    discountExpiresAt: '',
    creatorSharePercentage: '70',
  });

  useEffect(() => {
    loadPricing();
  }, [storyId]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const data = await marketplaceService.getStoryPricing(storyId);
      setPricing(data);
      if (data) {
        setFormData({
          pricingModel: data.pricingModel,
          priceAmount: data.priceAmount.toString(),
          chapterPrice: data.chapterPrice?.toString() || '0',
          freeChapters: data.freeChapters.toString(),
          subscriptionDurationDays: data.subscriptionDurationDays?.toString() || '30',
          discountPercentage: data.discountPercentage.toString(),
          discountExpiresAt: data.discountExpiresAt || '',
          creatorSharePercentage: data.creatorSharePercentage.toString(),
        });
      }
    } catch (error) {
      console.error('Failed to load pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      await marketplaceService.setStoryPricing(storyId, {
        pricingModel: formData.pricingModel,
        priceAmount: parseFloat(formData.priceAmount),
        chapterPrice:
          formData.pricingModel === 'chapter_based' ? parseFloat(formData.chapterPrice) : undefined,
        freeChapters:
          formData.pricingModel === 'chapter_based' ? parseInt(formData.freeChapters) : 0,
        subscriptionDurationDays:
          formData.pricingModel === 'subscription'
            ? parseInt(formData.subscriptionDurationDays)
            : undefined,
        discountPercentage: parseFloat(formData.discountPercentage),
        discountExpiresAt: formData.discountExpiresAt || undefined,
        creatorSharePercentage: parseFloat(formData.creatorSharePercentage),
        platformSharePercentage: 100 - parseFloat(formData.creatorSharePercentage),
        isActive: true,
      });

      toast.success('Pricing updated successfully!');
      loadPricing();
      onPricingUpdated?.();
    } catch (error: any) {
      console.error('Failed to save pricing:', error);
      toast.error(error.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-64 ${className}`} />
    );
  }

  return (
    <div className={`bg-card border-2 border-border rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Icon name="CurrencyDollarIcon" size={24} />
          Story Pricing
        </h3>
        {pricing && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              pricing.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}
          >
            {pricing.isActive ? 'Active' : 'Inactive'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Pricing Model */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Pricing Model</label>
          <select
            value={formData.pricingModel}
            onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value as any })}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="one_time">One-Time Purchase</option>
            <option value="chapter_based">Pay Per Chapter</option>
            <option value="subscription">Subscription</option>
            <option value="free_with_ads">Free with Ads</option>
          </select>
        </div>

        {/* Price Amount */}
        {(formData.pricingModel === 'one_time' || formData.pricingModel === 'subscription') && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.priceAmount}
                onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
          </div>
        )}

        {/* Chapter-Based Pricing */}
        {formData.pricingModel === 'chapter_based' && (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Free Chapters
              </label>
              <input
                type="number"
                min="0"
                value={formData.freeChapters}
                onChange={(e) => setFormData({ ...formData, freeChapters: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price Per Chapter (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.chapterPrice}
                  onChange={(e) => setFormData({ ...formData, chapterPrice: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
          </>
        )}

        {/* Subscription Duration */}
        {formData.pricingModel === 'subscription' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subscription Duration (Days)
            </label>
            <input
              type="number"
              min="1"
              value={formData.subscriptionDurationDays}
              onChange={(e) =>
                setFormData({ ...formData, subscriptionDurationDays: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        )}

        {/* Discount */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Discount Percentage
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
            <span className="px-4 py-2 text-muted-foreground">%</span>
          </div>
        </div>

        {parseFloat(formData.discountPercentage) > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Discount Expires At
            </label>
            <input
              type="datetime-local"
              value={formData.discountExpiresAt}
              onChange={(e) => setFormData({ ...formData, discountExpiresAt: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        )}

        {/* Revenue Share */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Share Percentage
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="0"
              max="100"
              value={formData.creatorSharePercentage}
              onChange={(e) => setFormData({ ...formData, creatorSharePercentage: e.target.value })}
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
            <span className="px-4 py-2 text-muted-foreground">%</span>
            <span className="text-sm text-muted-foreground">
              (Platform: {100 - parseFloat(formData.creatorSharePercentage)}%)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Default: 70% creator, 30% platform</p>
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Pricing'}
        </motion.button>
      </div>
    </div>
  );
}
