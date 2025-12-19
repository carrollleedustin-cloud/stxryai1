/**
 * Marketing Service
 * Manages marketing campaigns, social media posts, and email campaigns
 */

import { createClient } from '@/lib/supabase/client';

export interface MarketingCampaign {
  id: string;
  creatorId: string;
  storyId?: string;
  campaignName: string;
  campaignType: 'story_launch' | 'chapter_release' | 'promotion' | 'event' | 'newsletter' | 'social_media';
  description?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  campaignStatus: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  campaignContent: Record<string, any>;
  targetAudience: Record<string, any>;
  channels: string[];
  socialMediaPlatforms: string[];
  reachCount: number;
  engagementCount: number;
  conversionCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SocialMediaPost {
  id: string;
  campaignId?: string;
  creatorId: string;
  storyId?: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'reddit';
  postType: 'text' | 'image' | 'video' | 'link' | 'carousel' | 'story';
  content: string;
  mediaUrls: string[];
  linkUrl?: string;
  hashtags: string[];
  scheduledAt?: string;
  postedAt?: string;
  postStatus: 'draft' | 'scheduled' | 'posted' | 'failed' | 'deleted';
  externalPostId?: string;
  likesCount: number;
  sharesCount: number;
  commentsCount: number;
  viewsCount: number;
  clicksCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  campaignId?: string;
  creatorId: string;
  storyId?: string;
  subject: string;
  fromName?: string;
  fromEmail?: string;
  htmlContent?: string;
  textContent?: string;
  previewText?: string;
  recipientList: any[];
  recipientCount: number;
  scheduledAt?: string;
  sentAt?: string;
  emailStatus: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class MarketingService {
  private supabase = createClient();

  // ========================================
  // MARKETING CAMPAIGNS
  // ========================================

  /**
   * Create a marketing campaign
   */
  async createCampaign(
    creatorId: string,
    campaign: Partial<MarketingCampaign>
  ): Promise<MarketingCampaign> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .insert({
        creator_id: creatorId,
        story_id: campaign.storyId,
        campaign_name: campaign.campaignName || 'Untitled Campaign',
        campaign_type: campaign.campaignType || 'promotion',
        description: campaign.description,
        scheduled_start: campaign.scheduledStart,
        scheduled_end: campaign.scheduledEnd,
        is_recurring: campaign.isRecurring || false,
        recurrence_pattern: campaign.recurrencePattern,
        campaign_status: campaign.campaignStatus || 'draft',
        campaign_content: campaign.campaignContent || {},
        target_audience: campaign.targetAudience || {},
        channels: campaign.channels || [],
        social_media_platforms: campaign.socialMediaPlatforms || [],
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapCampaign(data);
  }

  /**
   * Get creator's campaigns
   */
  async getCreatorCampaigns(creatorId: string): Promise<MarketingCampaign[]> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapCampaign(item));
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    updates: Partial<MarketingCampaign>
  ): Promise<MarketingCampaign> {
    const { data, error } = await this.supabase
      .from('marketing_campaigns')
      .update({
        campaign_name: updates.campaignName,
        description: updates.description,
        scheduled_start: updates.scheduledStart,
        scheduled_end: updates.scheduledEnd,
        campaign_status: updates.campaignStatus,
        campaign_content: updates.campaignContent,
        target_audience: updates.targetAudience,
        channels: updates.channels,
        social_media_platforms: updates.socialMediaPlatforms,
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) throw error;
    return this.mapCampaign(data);
  }

  // ========================================
  // SOCIAL MEDIA POSTS
  // ========================================

  /**
   * Create a social media post
   */
  async createSocialPost(
    creatorId: string,
    post: Partial<SocialMediaPost>
  ): Promise<SocialMediaPost> {
    const { data, error } = await this.supabase
      .from('social_media_posts')
      .insert({
        campaign_id: post.campaignId,
        creator_id: creatorId,
        story_id: post.storyId,
        platform: post.platform,
        post_type: post.postType || 'text',
        content: post.content || '',
        media_urls: post.mediaUrls || [],
        link_url: post.linkUrl,
        hashtags: post.hashtags || [],
        scheduled_at: post.scheduledAt,
        post_status: post.postStatus || 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapSocialPost(data);
  }

  /**
   * Get creator's social posts
   */
  async getCreatorSocialPosts(creatorId: string): Promise<SocialMediaPost[]> {
    const { data, error } = await this.supabase
      .from('social_media_posts')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapSocialPost(item));
  }

  /**
   * Schedule a post
   */
  async schedulePost(postId: string, scheduledAt: string): Promise<SocialMediaPost> {
    const { data, error } = await this.supabase
      .from('social_media_posts')
      .update({
        scheduled_at: scheduledAt,
        post_status: 'scheduled',
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSocialPost(data);
  }

  // ========================================
  // EMAIL CAMPAIGNS
  // ========================================

  /**
   * Create an email campaign
   */
  async createEmailCampaign(
    creatorId: string,
    email: Partial<EmailCampaign>
  ): Promise<EmailCampaign> {
    const { data, error } = await this.supabase
      .from('email_campaigns')
      .insert({
        campaign_id: email.campaignId,
        creator_id: creatorId,
        story_id: email.storyId,
        subject: email.subject || 'Untitled Email',
        from_name: email.fromName,
        from_email: email.fromEmail,
        html_content: email.htmlContent,
        text_content: email.textContent,
        preview_text: email.previewText,
        recipient_list: email.recipientList || [],
        recipient_count: email.recipientList?.length || 0,
        scheduled_at: email.scheduledAt,
        email_status: email.emailStatus || 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapEmailCampaign(data);
  }

  /**
   * Get creator's email campaigns
   */
  async getCreatorEmailCampaigns(creatorId: string): Promise<EmailCampaign[]> {
    const { data, error } = await this.supabase
      .from('email_campaigns')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapEmailCampaign(item));
  }

  // ========================================
  // MAPPING FUNCTIONS
  // ========================================

  private mapCampaign(data: any): MarketingCampaign {
    return {
      id: data.id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      campaignName: data.campaign_name,
      campaignType: data.campaign_type,
      description: data.description,
      scheduledStart: data.scheduled_start,
      scheduledEnd: data.scheduled_end,
      isRecurring: data.is_recurring,
      recurrencePattern: data.recurrence_pattern,
      campaignStatus: data.campaign_status,
      startedAt: data.started_at,
      endedAt: data.ended_at,
      campaignContent: data.campaign_content || {},
      targetAudience: data.target_audience || {},
      channels: data.channels || [],
      socialMediaPlatforms: data.social_media_platforms || [],
      reachCount: data.reach_count || 0,
      engagementCount: data.engagement_count || 0,
      conversionCount: data.conversion_count || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapSocialPost(data: any): SocialMediaPost {
    return {
      id: data.id,
      campaignId: data.campaign_id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      platform: data.platform,
      postType: data.post_type,
      content: data.content,
      mediaUrls: data.media_urls || [],
      linkUrl: data.link_url,
      hashtags: data.hashtags || [],
      scheduledAt: data.scheduled_at,
      postedAt: data.posted_at,
      postStatus: data.post_status,
      externalPostId: data.external_post_id,
      likesCount: data.likes_count || 0,
      sharesCount: data.shares_count || 0,
      commentsCount: data.comments_count || 0,
      viewsCount: data.views_count || 0,
      clicksCount: data.clicks_count || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private mapEmailCampaign(data: any): EmailCampaign {
    return {
      id: data.id,
      campaignId: data.campaign_id,
      creatorId: data.creator_id,
      storyId: data.story_id,
      subject: data.subject,
      fromName: data.from_name,
      fromEmail: data.from_email,
      htmlContent: data.html_content,
      textContent: data.text_content,
      previewText: data.preview_text,
      recipientList: data.recipient_list || [],
      recipientCount: data.recipient_count || 0,
      scheduledAt: data.scheduled_at,
      sentAt: data.sent_at,
      emailStatus: data.email_status,
      sentCount: data.sent_count || 0,
      deliveredCount: data.delivered_count || 0,
      openedCount: data.opened_count || 0,
      clickedCount: data.clicked_count || 0,
      bouncedCount: data.bounced_count || 0,
      unsubscribedCount: data.unsubscribed_count || 0,
      metadata: data.metadata || {},
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const marketingService = new MarketingService();

