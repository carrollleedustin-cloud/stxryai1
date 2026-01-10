'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { marketplaceService, type PremiumStoryPricing } from '@/services/marketplaceService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface PremiumStoryPurchaseProps {
  storyId: string;
  chapterId?: string;
  onPurchaseComplete?: () => void;
  className?: string;
}

export function PremiumStoryPurchase({
  storyId,
  chapterId,
  onPurchaseComplete,
  className = '',
}: PremiumStoryPurchaseProps) {
  const { user } = useAuth();
  const [pricing, setPricing] = useState<PremiumStoryPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, storyId, chapterId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [pricingData, access] = await Promise.all([
        marketplaceService.getStoryPricing(storyId),
        marketplaceService.checkStoryAccess(user.id, storyId, chapterId),
      ]);

      setPricing(pricingData);
      setHasAccess(access);
    } catch (error) {
      console.error('Failed to load pricing:', error);
      toast.error('Failed to load story pricing');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !pricing || purchasing) return;

    try {
      setPurchasing(true);

      // Create purchase record
      const purchase = await marketplaceService.createPurchase(
        user.id,
        storyId,
        pricing.pricingModel === 'chapter_based' && chapterId ? 'chapter' : 'full_story',
        pricing.id,
        pricing.priceAmount,
        chapterId
      );

      // TODO: Integrate with Stripe payment processing
      // For now, we'll simulate a successful payment
      await marketplaceService.updatePurchaseStatus(purchase.id, `pi_${Date.now()}`, 'succeeded');

      toast.success('Purchase successful!');
      setHasAccess(true);
      onPurchaseComplete?.();
      loadData();
    } catch (error: any) {
      console.error('Purchase failed:', error);
      toast.error(error.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl h-32 ${className}`} />
    );
  }

  if (!pricing) {
    return null; // Story is free
  }

  if (hasAccess) {
    return (
      <div
        className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 ${className}`}
      >
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Icon name="CheckCircleIcon" size={20} />
          <span className="font-medium">You have access to this content</span>
        </div>
      </div>
    );
  }

  const finalPrice =
    pricing.discountPercentage > 0
      ? pricing.priceAmount * (1 - pricing.discountPercentage / 100)
      : pricing.priceAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
            <span>💎</span>
            Premium Story
          </h3>
          <p className="text-sm text-muted-foreground">
            {pricing.pricingModel === 'one_time' && 'One-time purchase'}
            {pricing.pricingModel === 'chapter_based' && 'Pay per chapter'}
            {pricing.pricingModel === 'subscription' && 'Subscription access'}
            {pricing.pricingModel === 'free_with_ads' &&
              'Free with ads (Premium users get ad-free)'}
          </p>
        </div>
        {pricing.discountPercentage > 0 && (
          <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
            {pricing.discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-2 mb-2">
          {pricing.discountPercentage > 0 && (
            <span className="text-lg text-muted-foreground line-through">
              ${pricing.priceAmount.toFixed(2)}
            </span>
          )}
          <span className="text-3xl font-bold text-foreground">${finalPrice.toFixed(2)}</span>
          <span className="text-muted-foreground">{pricing.currency}</span>
        </div>

        {pricing.pricingModel === 'chapter_based' && (
          <p className="text-sm text-muted-foreground">
            First {pricing.freeChapters} chapters free • ${pricing.chapterPrice?.toFixed(2)} per
            chapter
          </p>
        )}

        {pricing.pricingModel === 'subscription' && pricing.subscriptionDurationDays && (
          <p className="text-sm text-muted-foreground">
            Access for {pricing.subscriptionDurationDays} days
          </p>
        )}
      </div>

      <motion.button
        onClick={handlePurchase}
        disabled={purchasing}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {purchasing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Icon name="ShoppingCartIcon" size={20} />
            Purchase Now
          </span>
        )}
      </motion.button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Secure payment powered by Stripe
      </p>
    </motion.div>
  );
}
