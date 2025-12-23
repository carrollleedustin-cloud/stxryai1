/**
 * Virtual Currency Service (StxryCoins)
 * Manages in-app currency for tips, purchases, and unlocks
 */

import { getSupabaseClient } from '@/lib/supabase/client';

// ========================================
// TYPES
// ========================================

export interface CoinPackage {
  id: string;
  coins: number;
  price: number; // USD
  bonusPercentage: number;
  totalCoins: number; // coins + bonus
  popular?: boolean;
  bestValue?: boolean;
}

export interface UserWallet {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalPurchased: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // Positive = credit, negative = debit
  balance: number; // Balance after transaction
  description: string;
  metadata: TransactionMetadata;
  createdAt: string;
}

export type TransactionType = 
  | 'purchase'          // Bought coins
  | 'tip_sent'          // Tipped an author
  | 'tip_received'      // Received a tip
  | 'story_unlock'      // Unlocked premium story
  | 'collection_unlock' // Unlocked story collection
  | 'character_pack'    // Bought character pack
  | 'gift_sent'         // Sent coins to friend
  | 'gift_received'     // Received coins from friend
  | 'reward'            // Earned from challenge/achievement
  | 'refund'            // Refund
  | 'admin_adjustment'; // Admin adjustment

export interface TransactionMetadata {
  storyId?: string;
  storyTitle?: string;
  authorId?: string;
  authorName?: string;
  collectionId?: string;
  packId?: string;
  friendId?: string;
  friendName?: string;
  paymentId?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface TipOptions {
  presets: number[];
  minCustom: number;
  maxCustom: number;
}

export interface PremiumContent {
  id: string;
  type: 'story' | 'collection' | 'character_pack';
  title: string;
  description: string;
  price: number; // In coins
  authorId: string;
  authorName: string;
  coverImage?: string;
}

// ========================================
// CONFIGURATION
// ========================================

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'coins_100',
    coins: 100,
    price: 0.99,
    bonusPercentage: 0,
    totalCoins: 100,
  },
  {
    id: 'coins_500',
    coins: 500,
    price: 4.99,
    bonusPercentage: 10,
    totalCoins: 550,
    popular: true,
  },
  {
    id: 'coins_1000',
    coins: 1000,
    price: 9.99,
    bonusPercentage: 20,
    totalCoins: 1200,
  },
  {
    id: 'coins_5000',
    coins: 5000,
    price: 39.99,
    bonusPercentage: 40,
    totalCoins: 7000,
    bestValue: true,
  },
];

export const TIP_OPTIONS: TipOptions = {
  presets: [10, 50, 100, 500],
  minCustom: 1,
  maxCustom: 10000,
};

// Creator revenue share from tips
export const CREATOR_TIP_SHARE = 0.80; // 80% to creator
export const PLATFORM_TIP_FEE = 0.20;  // 20% platform fee

// ========================================
// SERVICE CLASS
// ========================================

class VirtualCurrencyService {
  private getSupabase() {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured');
    }
    return client;
  }

  // ==================== WALLET ====================

  /**
   * Get user's wallet
   */
  async getWallet(userId: string): Promise<UserWallet> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create wallet for new user
        return this.createWallet(userId);
      }
      console.error('Error fetching wallet:', error);
      throw error;
    }

    return this.mapWallet(data);
  }

  /**
   * Create wallet for new user
   */
  async createWallet(userId: string): Promise<UserWallet> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('user_wallets')
      .insert({
        user_id: userId,
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        total_purchased: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }

    return this.mapWallet(data);
  }

  /**
   * Get user's balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet.balance;
  }

  // ==================== PURCHASES ====================

  /**
   * Get available coin packages
   */
  getCoinPackages(): CoinPackage[] {
    return COIN_PACKAGES;
  }

  /**
   * Purchase coins
   */
  async purchaseCoins(
    userId: string,
    packageId: string,
    paymentId: string
  ): Promise<{ success: boolean; newBalance: number; transaction: Transaction }> {
    const coinPackage = COIN_PACKAGES.find(p => p.id === packageId);
    if (!coinPackage) {
      throw new Error('Invalid package');
    }

    const supabase = this.getSupabase();

    // Start transaction
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!wallet) {
      await this.createWallet(userId);
    }

    const newBalance = (wallet?.balance || 0) + coinPackage.totalCoins;

    // Update wallet
    const { error: updateError } = await supabase
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_purchased: (wallet?.total_purchased || 0) + coinPackage.totalCoins,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    // Record transaction
    const transaction = await this.recordTransaction(
      userId,
      'purchase',
      coinPackage.totalCoins,
      newBalance,
      `Purchased ${coinPackage.coins} coins${coinPackage.bonusPercentage > 0 ? ` (+${coinPackage.bonusPercentage}% bonus)` : ''}`,
      { paymentId, packageId }
    );

    return {
      success: true,
      newBalance,
      transaction,
    };
  }

  // ==================== TIPS ====================

  /**
   * Send tip to author
   */
  async sendTip(
    senderId: string,
    authorId: string,
    amount: number,
    storyId?: string,
    message?: string
  ): Promise<{ success: boolean; senderBalance: number; authorReceived: number }> {
    // Validate amount
    if (amount < TIP_OPTIONS.minCustom || amount > TIP_OPTIONS.maxCustom) {
      throw new Error('Invalid tip amount');
    }

    const supabase = this.getSupabase();

    // Check sender balance
    const senderWallet = await this.getWallet(senderId);
    if (senderWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Calculate creator share
    const authorReceived = Math.floor(amount * CREATOR_TIP_SHARE);

    // Get story info for metadata
    let storyTitle: string | undefined;
    if (storyId) {
      const { data: story } = await supabase
        .from('stories')
        .select('title')
        .eq('id', storyId)
        .single();
      storyTitle = story?.title;
    }

    // Get author info
    const { data: author } = await supabase
      .from('users')
      .select('username')
      .eq('id', authorId)
      .single();

    // Debit sender
    const senderNewBalance = senderWallet.balance - amount;
    await supabase
      .from('user_wallets')
      .update({
        balance: senderNewBalance,
        total_spent: senderWallet.totalSpent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', senderId);

    await this.recordTransaction(
      senderId,
      'tip_sent',
      -amount,
      senderNewBalance,
      `Tipped ${author?.username || 'author'}${storyTitle ? ` for "${storyTitle}"` : ''}`,
      { authorId, authorName: author?.username, storyId, storyTitle, message }
    );

    // Credit author
    const authorWallet = await this.getWallet(authorId);
    const authorNewBalance = authorWallet.balance + authorReceived;
    await supabase
      .from('user_wallets')
      .update({
        balance: authorNewBalance,
        total_earned: authorWallet.totalEarned + authorReceived,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authorId);

    // Get sender info for notification
    const { data: sender } = await supabase
      .from('users')
      .select('username')
      .eq('id', senderId)
      .single();

    await this.recordTransaction(
      authorId,
      'tip_received',
      authorReceived,
      authorNewBalance,
      `Received tip from ${sender?.username || 'reader'}${storyTitle ? ` for "${storyTitle}"` : ''}`,
      { senderId, senderName: sender?.username, storyId, storyTitle, message, originalAmount: amount }
    );

    return {
      success: true,
      senderBalance: senderNewBalance,
      authorReceived,
    };
  }

  // ==================== UNLOCKS ====================

  /**
   * Unlock premium content
   */
  async unlockContent(
    userId: string,
    contentId: string,
    contentType: 'story' | 'collection' | 'character_pack'
  ): Promise<{ success: boolean; newBalance: number }> {
    const supabase = this.getSupabase();

    // Get content details
    const tableName = contentType === 'story' ? 'stories' :
                      contentType === 'collection' ? 'story_collections' :
                      'character_packs';

    const { data: content, error: contentError } = await supabase
      .from(tableName)
      .select('id, title, premium_price, author_id')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      throw new Error('Content not found');
    }

    const price = content.premium_price;
    if (!price || price <= 0) {
      throw new Error('Content is not premium');
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('content_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (existing) {
      throw new Error('Content already unlocked');
    }

    // Check balance
    const wallet = await this.getWallet(userId);
    if (wallet.balance < price) {
      throw new Error('Insufficient balance');
    }

    // Deduct from wallet
    const newBalance = wallet.balance - price;
    await supabase
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_spent: wallet.totalSpent + price,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Record unlock
    await supabase.from('content_unlocks').insert({
      user_id: userId,
      content_id: contentId,
      content_type: contentType,
      price_paid: price,
    });

    // Record transaction
    const transactionType = contentType === 'story' ? 'story_unlock' :
                            contentType === 'collection' ? 'collection_unlock' :
                            'character_pack';

    await this.recordTransaction(
      userId,
      transactionType,
      -price,
      newBalance,
      `Unlocked ${content.title}`,
      { contentId, contentType, title: content.title }
    );

    // Credit author (revenue share)
    const authorShare = Math.floor(price * 0.70); // 70% to author
    if (content.author_id && authorShare > 0) {
      const authorWallet = await this.getWallet(content.author_id);
      await supabase
        .from('user_wallets')
        .update({
          balance: authorWallet.balance + authorShare,
          total_earned: authorWallet.totalEarned + authorShare,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', content.author_id);

      await this.recordTransaction(
        content.author_id,
        'tip_received', // Reusing for revenue
        authorShare,
        authorWallet.balance + authorShare,
        `Revenue from "${content.title}" unlock`,
        { contentId, contentType, buyerId: userId }
      );
    }

    return { success: true, newBalance };
  }

  /**
   * Check if user has unlocked content
   */
  async hasUnlockedContent(
    userId: string,
    contentId: string,
    contentType: 'story' | 'collection' | 'character_pack'
  ): Promise<boolean> {
    const supabase = this.getSupabase();

    const { data } = await supabase
      .from('content_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    return !!data;
  }

  // ==================== GIFTS ====================

  /**
   * Send coins to a friend
   */
  async sendGift(
    senderId: string,
    recipientId: string,
    amount: number,
    message?: string
  ): Promise<{ success: boolean; senderBalance: number }> {
    if (amount < 10) {
      throw new Error('Minimum gift is 10 coins');
    }

    const supabase = this.getSupabase();

    // Check sender balance
    const senderWallet = await this.getWallet(senderId);
    if (senderWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Get user info
    const { data: sender } = await supabase
      .from('users').select('username').eq('id', senderId).single();
    const { data: recipient } = await supabase
      .from('users').select('username').eq('id', recipientId).single();

    // Debit sender
    const senderNewBalance = senderWallet.balance - amount;
    await supabase
      .from('user_wallets')
      .update({
        balance: senderNewBalance,
        total_spent: senderWallet.totalSpent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', senderId);

    await this.recordTransaction(
      senderId,
      'gift_sent',
      -amount,
      senderNewBalance,
      `Sent ${amount} coins to ${recipient?.username || 'friend'}`,
      { friendId: recipientId, friendName: recipient?.username, message }
    );

    // Credit recipient
    const recipientWallet = await this.getWallet(recipientId);
    const recipientNewBalance = recipientWallet.balance + amount;
    await supabase
      .from('user_wallets')
      .update({
        balance: recipientNewBalance,
        total_earned: recipientWallet.totalEarned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', recipientId);

    await this.recordTransaction(
      recipientId,
      'gift_received',
      amount,
      recipientNewBalance,
      `Received ${amount} coins from ${sender?.username || 'friend'}`,
      { friendId: senderId, friendName: sender?.username, message }
    );

    return { success: true, senderBalance: senderNewBalance };
  }

  // ==================== REWARDS ====================

  /**
   * Award coins for achievement/challenge
   */
  async awardCoins(
    userId: string,
    amount: number,
    reason: string,
    metadata?: TransactionMetadata
  ): Promise<{ newBalance: number }> {
    const supabase = this.getSupabase();
    const wallet = await this.getWallet(userId);

    const newBalance = wallet.balance + amount;
    await supabase
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_earned: wallet.totalEarned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    await this.recordTransaction(
      userId,
      'reward',
      amount,
      newBalance,
      reason,
      metadata || {}
    );

    return { newBalance };
  }

  // ==================== TRANSACTIONS ====================

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Transaction[]> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return (data || []).map(this.mapTransaction);
  }

  /**
   * Get transaction summary
   */
  async getTransactionSummary(
    userId: string,
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    totalEarned: number;
    totalSpent: number;
    tipsReceived: number;
    tipsSent: number;
    purchaseRevenue: number;
  }> {
    const supabase = this.getSupabase();

    const cutoff = new Date();
    switch (period) {
      case 'week': cutoff.setDate(cutoff.getDate() - 7); break;
      case 'month': cutoff.setMonth(cutoff.getMonth() - 1); break;
      case 'year': cutoff.setFullYear(cutoff.getFullYear() - 1); break;
    }

    const { data } = await supabase
      .from('coin_transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('created_at', cutoff.toISOString());

    const transactions = data || [];

    return {
      totalEarned: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalSpent: Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
      tipsReceived: transactions.filter(t => t.type === 'tip_received').reduce((sum, t) => sum + t.amount, 0),
      tipsSent: Math.abs(transactions.filter(t => t.type === 'tip_sent').reduce((sum, t) => sum + t.amount, 0)),
      purchaseRevenue: transactions.filter(t => ['story_unlock', 'collection_unlock'].includes(t.type))
        .filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    };
  }

  // ==================== PRIVATE METHODS ====================

  private async recordTransaction(
    userId: string,
    type: TransactionType,
    amount: number,
    balance: number,
    description: string,
    metadata: TransactionMetadata
  ): Promise<Transaction> {
    const supabase = this.getSupabase();

    const { data, error } = await supabase
      .from('coin_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        balance,
        description,
        metadata,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }

    return this.mapTransaction(data);
  }

  private mapWallet(data: any): UserWallet {
    return {
      userId: data.user_id,
      balance: data.balance || 0,
      totalEarned: data.total_earned || 0,
      totalSpent: data.total_spent || 0,
      totalPurchased: data.total_purchased || 0,
      lastUpdated: data.updated_at || data.created_at,
    };
  }

  private mapTransaction(data: any): Transaction {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: data.amount,
      balance: data.balance,
      description: data.description,
      metadata: data.metadata || {},
      createdAt: data.created_at,
    };
  }
}

export const virtualCurrencyService = new VirtualCurrencyService();

