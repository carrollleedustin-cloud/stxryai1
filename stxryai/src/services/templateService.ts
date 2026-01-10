/**
 * Template Service
 * Manages writing templates for creators
 */

import { createClient } from '@/lib/supabase/client';

export interface WritingTemplate {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  category?:
    | 'story_structure'
    | 'character_development'
    | 'plot_outline'
    | 'world_building'
    | 'dialogue'
    | 'custom';
  templateContent: any; // JSONB structure
  templateType: 'outline' | 'checklist' | 'form' | 'guide';
  isPublic: boolean;
  usageCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export class TemplateService {
  private supabase = createClient();

  /**
   * Create a template
   */
  async createTemplate(
    creatorId: string,
    template: Partial<WritingTemplate>
  ): Promise<WritingTemplate> {
    const { data, error } = await this.supabase
      .from('writing_templates')
      .insert({
        creator_id: creatorId,
        name: template.name || 'Untitled Template',
        description: template.description,
        category: template.category,
        template_content: template.templateContent || {},
        template_type: template.templateType || 'outline',
        is_public: template.isPublic || false,
        is_featured: template.isFeatured || false,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplate(data);
  }

  /**
   * Get public templates
   */
  async getPublicTemplates(category?: string): Promise<WritingTemplate[]> {
    let query = this.supabase
      .from('writing_templates')
      .select('*')
      .eq('is_public', true)
      .order('usage_count', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((item: any) => this.mapTemplate(item));
  }

  /**
   * Get user's templates
   */
  async getUserTemplates(creatorId: string): Promise<WritingTemplate[]> {
    const { data, error } = await this.supabase
      .from('writing_templates')
      .select('*')
      .eq('creator_id', creatorId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => this.mapTemplate(item));
  }

  /**
   * Get a template
   */
  async getTemplate(templateId: string): Promise<WritingTemplate | null> {
    const { data, error } = await this.supabase
      .from('writing_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapTemplate(data);
  }

  /**
   * Use a template (tracks usage)
   */
  async useTemplate(templateId: string, userId: string, storyId?: string): Promise<void> {
    const { error } = await this.supabase.from('template_usage').insert({
      template_id: templateId,
      user_id: userId,
      story_id: storyId,
    });

    if (error) throw error;
  }

  /**
   * Update template
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<WritingTemplate>
  ): Promise<WritingTemplate> {
    const { data, error } = await this.supabase
      .from('writing_templates')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        template_content: updates.templateContent,
        template_type: updates.templateType,
        is_public: updates.isPublic,
        is_featured: updates.isFeatured,
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return this.mapTemplate(data);
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await this.supabase.from('writing_templates').delete().eq('id', templateId);

    if (error) throw error;
  }

  private mapTemplate(data: any): WritingTemplate {
    return {
      id: data.id,
      creatorId: data.creator_id,
      name: data.name,
      description: data.description,
      category: data.category,
      templateContent: data.template_content || {},
      templateType: data.template_type,
      isPublic: data.is_public,
      usageCount: data.usage_count || 0,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const templateService = new TemplateService();
