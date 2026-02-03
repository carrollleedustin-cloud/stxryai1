/**
 * Marketplace Service
 * Story sales, bundles, tips, and creator monetization
 */

import { createClient } from '@/lib/supabase/client';

export interface MarketplaceListing {
  id: string;
  storyId: string;
  storyTitle: string;
  storyDescription: string;
  coverImageUrl: string;
  sellerId: string;
  sellerName: string;
  listingType: 'single_purchase' | 'subscription' | 'bundle' | 'rental';
  priceUsd: number;
  priceCoins: number | null;
  discountPercentage: number;
  discountEndsAt: string | null;
  rentalDurationDays: number | null;
  salesCount: number;
  isOwned?: boolean;
}

export interface StoryBundle {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string | null;
  priceUsd: number;
  savingsPercentage: number | null;
  stories: Array<{
    id: string;
    title: string;
    coverImageUrl: string;
  }>;
}

export interface AuthorTipJar {
  authorId: string;
  authorName: string;
  avatarUrl: string | null;
  isEnabled: boolean;
  minimumTipUsd: number;
  suggestedAmounts: number[];
  thankYouMessage: string | null;
  totalReceivedUsd: number;
}

export interface AuthorRevenue {
  period: string;
  grossRevenueUsd: number;
  platformFeesUsd: number;
  netRevenueUsd: number;
  tipsReceivedUsd: number;
  salesCount: number;
}

class MarketplaceService {
  private supabase = createClient();
  private platformFeePercentage = 0.30; // 30% platform fee

  /**
   * Get marketplace listings
   */
  async getListings(options?: {
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'popular' | 'price_low' | 'price_high';
    limit?: number;
  }): Promise<MarketplaceListing[]> {
    try {
      let query = this.supabase
        .from('marketplace_listings')
        .select(`
          *,
          stories!marketplace_listings_story_id_fkey (
            id, title, description, cover_image_url, genre
          ),
          user_profiles!marketplace_listings_seller_id_fkey (
            display_name
          )
        `)
        .eq('is_active', true);

      if (options?.minPrice) {
        query = query.gte('price_usd', options.minPrice);
      }
      if (options?.maxPrice) {
        query = query.lte('price_usd', options.maxPrice);
      }

      // Sort
      switch (options?.sortBy) {
        case 'popular':
          query = query.order('sales_count', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price_usd', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price_usd', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      query = query.limit(options?.limit || 50);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        return [];
      }

      return (data || []).map((listing) => {
        const story = listing.stories as any;
        const seller = listing.user_profiles as any;
        return {
          id: listing.id,
          storyId: listing.story_id,
          storyTitle: story?.title || '',
          storyDescription: story?.description || '',
          coverImageUrl: story?.cover_image_url || '',
          sellerId: listing.seller_id,
          sellerName: seller?.display_name || 'Unknown',
          listingType: listing.listing_type,
          priceUsd: listing.price_usd,
          priceCoins: listing.price_coins,
          discountPercentage: listing.discount_percentage,
          discountEndsAt: listing.discount_ends_at,
          rentalDurationDays: listing.rental_duration_days,
          salesCount: listing.sales_count,
        };
      });
    } catch (error) {
      console.error('Error in getListings:', error);
      return [];
    }
  }

  /**
   * Get listing by story ID
   */
  async getListingByStory(storyId: string, userId?: string): Promise<MarketplaceListing | null> {
    try {
      const { data, error } = await this.supabase
        .from('marketplace_listings')
        .select(`
          *,
          stories!marketplace_listings_story_id_fkey (
            id, title, description, cover_image_url
          ),
          user_profiles!marketplace_listings_seller_id_fkey (
            display_name
          )
        `)
        .eq('story_id', storyId)
        .eq('is_active', true)
        .single();

      if (error) {
        return null;
      }

      const story = data.stories as any;
      const seller = data.user_profiles as any;

      const listing: MarketplaceListing = {
        id: data.id,
        storyId: data.story_id,
        storyTitle: story?.title || '',
        storyDescription: story?.description || '',
        coverImageUrl: story?.cover_image_url || '',
        sellerId: data.seller_id,
        sellerName: seller?.display_name || 'Unknown',
        listingType: data.listing_type,
        priceUsd: data.price_usd,
        priceCoins: data.price_coins,
        discountPercentage: data.discount_percentage,
        discountEndsAt: data.discount_ends_at,
        rentalDurationDays: data.rental_duration_days,
        salesCount: data.sales_count,
      };

      // Check if user owns this
      if (userId) {
        const { data: purchase } = await this.supabase
          .from('content_purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('story_id', storyId)
          .single();

        listing.isOwned = !!purchase;
      }

      return listing;
    } catch (error) {
      console.error('Error in getListingByStory:', error);
      return null;
    }
  }

  /**
   * Purchase a story
   */
  async purchaseStory(
    userId: string,
    listingId: string,
    paymentMethod: 'coins' | 'stripe'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get listing
      const { data: listing } = await this.supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', listingId)
        .eq('is_active', true)
        .single();

      if (!listing) {
        return { success: false, error: 'Listing not found' };
      }

      // Check if already purchased
      const { data: existing } = await this.supabase
        .from('content_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('story_id', listing.story_id)
        .single();

      if (existing) {
        return { success: false, error: 'You already own this story' };
      }

      // Calculate price with discount
      let finalPrice = listing.price_usd;
      if (listing.discount_percentage > 0) {
        if (!listing.discount_ends_at || new Date(listing.discount_ends_at) > new Date()) {
          finalPrice = finalPrice * (1 - listing.discount_percentage / 100);
        }
      }

      if (paymentMethod === 'coins') {
        // Check if listing accepts coins
        if (!listing.price_coins) {
          return { success: false, error: 'This listing does not accept coins' };
        }

        // Check user coin balance
        const { data: wallet } = await this.supabase
          .from('user_wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!wallet || wallet.balance < listing.price_coins) {
          return { success: false, error: 'Insufficient coins' };
        }

        // Deduct coins
        await this.supabase.rpc('deduct_coins', {
          p_user_id: userId,
          p_amount: listing.price_coins,
          p_reason: `Purchase: ${listing.story_id}`,
        });
      }

      // Record purchase
      const platformFee = finalPrice * this.platformFeePercentage;
      const sellerRevenue = finalPrice - platformFee;

      await this.supabase.from('marketplace_purchases').insert({
        buyer_id: userId,
        listing_id: listingId,
        amount_paid_usd: finalPrice,
        platform_fee_usd: platformFee,
        seller_revenue_usd: sellerRevenue,
      });

      // Grant access
      await this.supabase.from('content_purchases').insert({
        user_id: userId,
        story_id: listing.story_id,
        purchase_type: 'full_access',
        payment_method: paymentMethod,
        amount_paid: finalPrice,
        coins_spent: paymentMethod === 'coins' ? listing.price_coins : null,
      });

      // Update sales count
      await this.supabase
        .from('marketplace_listings')
        .update({
          sales_count: listing.sales_count + 1,
          revenue_total: (listing.revenue_total || 0) + sellerRevenue,
        })
        .eq('id', listingId);

      return { success: true };
    } catch (error) {
      console.error('Error in purchaseStory:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get bundles
   */
  async getBundles(sellerId?: string): Promise<StoryBundle[]> {
    try {
      let query = this.supabase
        .from('story_bundles')
        .select(`
          *,
          user_profiles!story_bundles_seller_id_fkey (display_name),
          bundle_stories!bundle_stories_bundle_id_fkey (
            stories!bundle_stories_story_id_fkey (
              id, title, cover_image_url
            )
          )
        `)
        .eq('is_active', true);

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bundles:', error);
        return [];
      }

      return (data || []).map((bundle) => ({
        id: bundle.id,
        sellerId: bundle.seller_id,
        sellerName: (bundle.user_profiles as any)?.display_name || 'Unknown',
        name: bundle.name,
        description: bundle.description,
        priceUsd: bundle.price_usd,
        savingsPercentage: bundle.savings_percentage,
        stories: (bundle.bundle_stories || []).map((bs: any) => ({
          id: bs.stories?.id,
          title: bs.stories?.title,
          coverImageUrl: bs.stories?.cover_image_url,
        })),
      }));
    } catch (error) {
      console.error('Error in getBundles:', error);
      return [];
    }
  }

  /**
   * Get author's tip jar
   */
  async getAuthorTipJar(authorId: string): Promise<AuthorTipJar | null> {
    try {
      const { data, error } = await this.supabase
        .from('author_tip_jars')
        .select(`
          *,
          user_profiles!author_tip_jars_author_id_fkey (
            display_name, avatar_url
          )
        `)
        .eq('author_id', authorId)
        .eq('is_enabled', true)
        .single();

      if (error) {
        return null;
      }

      const profile = data.user_profiles as any;
      return {
        authorId: data.author_id,
        authorName: profile?.display_name || 'Unknown',
        avatarUrl: profile?.avatar_url,
        isEnabled: data.is_enabled,
        minimumTipUsd: data.minimum_tip_usd,
        suggestedAmounts: data.suggested_amounts || [1, 3, 5, 10],
        thankYouMessage: data.thank_you_message,
        totalReceivedUsd: data.total_received_usd,
      };
    } catch (error) {
      console.error('Error in getAuthorTipJar:', error);
      return null;
    }
  }

  /**
   * Send tip to author
   */
  async sendTip(
    tipperId: string,
    authorId: string,
    amountUsd: number,
    message?: string,
    storyId?: string,
    isAnonymous: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get tip jar
      const tipJar = await this.getAuthorTipJar(authorId);
      
      if (!tipJar || !tipJar.isEnabled) {
        return { success: false, error: 'Author is not accepting tips' };
      }

      if (amountUsd < tipJar.minimumTipUsd) {
        return { success: false, error: `Minimum tip is $${tipJar.minimumTipUsd}` };
      }

      // Record tip
      await this.supabase.from('author_tips').insert({
        author_id: authorId,
        tipper_id: isAnonymous ? null : tipperId,
        story_id: storyId,
        amount_usd: amountUsd,
        message,
        is_anonymous: isAnonymous,
      });

      // Update tip jar total
      await this.supabase
        .from('author_tip_jars')
        .update({
          total_received_usd: tipJar.totalReceivedUsd + amountUsd,
        })
        .eq('author_id', authorId);

      return { success: true };
    } catch (error) {
      console.error('Error in sendTip:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Gift a story
   */
  async giftStory(
    senderId: string,
    recipientId: string,
    storyId: string,
    message?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if recipient already owns it
      const { data: existing } = await this.supabase
        .from('content_purchases')
        .select('id')
        .eq('user_id', recipientId)
        .eq('story_id', storyId)
        .single();

      if (existing) {
        return { success: false, error: 'Recipient already owns this story' };
      }

      // Get listing price
      const listing = await this.getListingByStory(storyId);
      
      if (!listing) {
        return { success: false, error: 'Story is not for sale' };
      }

      // Record gift
      await this.supabase.from('story_gifts').insert({
        sender_id: senderId,
        recipient_id: recipientId,
        story_id: storyId,
        gift_message: message,
        amount_paid_usd: listing.priceUsd,
      });

      // Grant access to recipient
      await this.supabase.from('content_purchases').insert({
        user_id: recipientId,
        story_id: storyId,
        purchase_type: 'full_access',
        payment_method: 'gift',
        amount_paid: 0,
      });

      return { success: true };
    } catch (error) {
      console.error('Error in giftStory:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Get author revenue
   */
  async getAuthorRevenue(authorId: string): Promise<AuthorRevenue[]> {
    try {
      const { data, error } = await this.supabase
        .from('author_revenue')
        .select('*')
        .eq('author_id', authorId)
        .order('period_start', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching revenue:', error);
        return [];
      }

      return (data || []).map((r) => ({
        period: `${r.period_start} - ${r.period_end}`,
        grossRevenueUsd: r.gross_revenue_usd,
        platformFeesUsd: r.platform_fees_usd,
        netRevenueUsd: r.net_revenue_usd,
        tipsReceivedUsd: r.tips_received_usd,
        salesCount: r.sales_count,
      }));
    } catch (error) {
      console.error('Error in getAuthorRevenue:', error);
      return [];
    }
  }

  /**
   * Create marketplace listing
   */
  async createListing(
    sellerId: string,
    storyId: string,
    data: {
      listingType: 'single_purchase' | 'subscription' | 'rental';
      priceUsd: number;
      priceCoins?: number;
      rentalDurationDays?: number;
    }
  ): Promise<{ success: boolean; listingId?: string; error?: string }> {
    try {
      // Verify seller owns the story
      const { data: story } = await this.supabase
        .from('stories')
        .select('author_id')
        .eq('id', storyId)
        .single();

      if (!story || story.author_id !== sellerId) {
        return { success: false, error: 'You do not own this story' };
      }

      // Check for existing listing
      const { data: existing } = await this.supabase
        .from('marketplace_listings')
        .select('id')
        .eq('story_id', storyId)
        .eq('is_active', true)
        .single();

      if (existing) {
        return { success: false, error: 'Story already has an active listing' };
      }

      const { data: listing, error } = await this.supabase
        .from('marketplace_listings')
        .insert({
          story_id: storyId,
          seller_id: sellerId,
          listing_type: data.listingType,
          price_usd: data.priceUsd,
          price_coins: data.priceCoins,
          rental_duration_days: data.rentalDurationDays,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating listing:', error);
        return { success: false, error: 'Failed to create listing' };
      }

      return { success: true, listingId: listing.id };
    } catch (error) {
      console.error('Error in createListing:', error);
      return { success: false, error: 'An error occurred' };
    }
  }

  /**
   * Check if user owns story
   */
  async checkOwnership(userId: string, storyId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('content_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single();

      return !!data;
    } catch (error) {
      return false;
    }
  }
}

export const marketplaceService = new MarketplaceService();
