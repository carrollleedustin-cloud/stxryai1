/**
 * Story Branching Service
 * Visual tree of story paths, completion tracking, choice heatmaps
 */

import { createClient } from '@/lib/supabase/client';

export interface BranchNode {
  id: string;
  storyId: string;
  chapterId: string | null;
  nodeType: 'start' | 'chapter' | 'choice' | 'ending';
  label: string;
  xPosition: number;
  yPosition: number;
  metadata: Record<string, any>;
}

export interface BranchEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  choiceText: string | null;
  traversalCount: number;
}

export interface PathCompletion {
  storyId: string;
  totalPaths: number;
  pathsCompleted: number;
  endingsDiscovered: string[];
  completionPercentage: number;
  allEndingsBadgeAwarded: boolean;
}

export interface ChoiceHeatmapData {
  chapterId: string;
  choiceIndex: number;
  choiceText: string;
  selectionCount: number;
  percentage: number;
}

export interface UserPath {
  id: string;
  pathNodes: string[];
  endingReached: string | null;
  completedAt: string;
}

class StoryBranchingService {
  private supabase = createClient();

  /**
   * Get story branch structure
   */
  async getStoryBranches(storyId: string): Promise<{ nodes: BranchNode[]; edges: BranchEdge[] }> {
    try {
      // Get nodes
      const { data: nodes, error: nodesError } = await this.supabase
        .from('story_branch_nodes')
        .select('*')
        .eq('story_id', storyId)
        .order('y_position', { ascending: true });

      if (nodesError) {
        console.error('Error fetching branch nodes:', nodesError);
        return { nodes: [], edges: [] };
      }

      // Get edges
      const { data: edges, error: edgesError } = await this.supabase
        .from('story_branch_edges')
        .select('*')
        .eq('story_id', storyId);

      if (edgesError) {
        console.error('Error fetching branch edges:', edgesError);
        return { nodes: this.mapNodes(nodes || []), edges: [] };
      }

      return {
        nodes: this.mapNodes(nodes || []),
        edges: this.mapEdges(edges || []),
      };
    } catch (error) {
      console.error('Error in getStoryBranches:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Generate branch structure from story
   */
  async generateBranchStructure(storyId: string): Promise<{ nodes: BranchNode[]; edges: BranchEdge[] }> {
    try {
      // Get chapters and choices
      const { data: chapters } = await this.supabase
        .from('story_chapters')
        .select(`
          id, title, order_index, is_ending,
          story_choices!story_choices_chapter_id_fkey (
            id, choice_text, next_chapter_id
          )
        `)
        .eq('story_id', storyId)
        .order('order_index', { ascending: true });

      if (!chapters || chapters.length === 0) {
        return { nodes: [], edges: [] };
      }

      const nodes: Omit<BranchNode, 'id'>[] = [];
      const edges: Omit<BranchEdge, 'id'>[] = [];
      const nodeMap = new Map<string, number>();

      // Create start node
      nodes.push({
        storyId,
        chapterId: null,
        nodeType: 'start',
        label: 'Start',
        xPosition: 0,
        yPosition: 0,
        metadata: {},
      });
      nodeMap.set('start', 0);

      // Process chapters
      let yPos = 1;
      for (const chapter of chapters) {
        const nodeIndex = nodes.length;
        const nodeType = chapter.is_ending ? 'ending' : 'chapter';
        
        nodes.push({
          storyId,
          chapterId: chapter.id,
          nodeType,
          label: chapter.title || `Chapter ${chapter.order_index + 1}`,
          xPosition: 0,
          yPosition: yPos,
          metadata: { orderIndex: chapter.order_index },
        });
        nodeMap.set(chapter.id, nodeIndex);

        // Edge from previous
        if (chapter.order_index === 0) {
          edges.push({
            fromNodeId: 'start_temp',
            toNodeId: `temp_${chapter.id}`,
            choiceText: null,
            traversalCount: 0,
          });
        }

        // Process choices
        const choices = chapter.story_choices as any[] || [];
        if (choices.length > 0) {
          let xOffset = -((choices.length - 1) / 2);
          for (const choice of choices) {
            if (choice.next_chapter_id) {
              edges.push({
                fromNodeId: `temp_${chapter.id}`,
                toNodeId: `temp_${choice.next_chapter_id}`,
                choiceText: choice.choice_text,
                traversalCount: 0,
              });
            }
            xOffset++;
          }
        }

        yPos++;
      }

      // Insert nodes
      const insertedNodes: BranchNode[] = [];
      for (const node of nodes) {
        const { data } = await this.supabase
          .from('story_branch_nodes')
          .insert({
            story_id: node.storyId,
            chapter_id: node.chapterId,
            node_type: node.nodeType,
            label: node.label,
            x_position: node.xPosition,
            y_position: node.yPosition,
            metadata: node.metadata,
          })
          .select()
          .single();

        if (data) {
          insertedNodes.push(this.mapNode(data));
        }
      }

      // Update edges with real node IDs and insert
      const insertedEdges: BranchEdge[] = [];
      for (const edge of edges) {
        // Find actual node IDs
        const fromNode = insertedNodes.find(n => 
          edge.fromNodeId === 'start_temp' ? n.nodeType === 'start' : n.chapterId === edge.fromNodeId.replace('temp_', '')
        );
        const toNode = insertedNodes.find(n => 
          n.chapterId === edge.toNodeId.replace('temp_', '')
        );

        if (fromNode && toNode) {
          const { data } = await this.supabase
            .from('story_branch_edges')
            .insert({
              story_id: storyId,
              from_node_id: fromNode.id,
              to_node_id: toNode.id,
              choice_text: edge.choiceText,
              traversal_count: 0,
            })
            .select()
            .single();

          if (data) {
            insertedEdges.push(this.mapEdge(data));
          }
        }
      }

      return { nodes: insertedNodes, edges: insertedEdges };
    } catch (error) {
      console.error('Error generating branch structure:', error);
      return { nodes: [], edges: [] };
    }
  }

  /**
   * Get user's path completion for a story
   */
  async getPathCompletion(userId: string, storyId: string): Promise<PathCompletion | null> {
    try {
      const { data, error } = await this.supabase
        .from('story_path_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching path completion:', error);
        return null;
      }

      if (!data) {
        // Initialize
        const totalPaths = await this.countTotalPaths(storyId);
        
        await this.supabase.from('story_path_completions').insert({
          user_id: userId,
          story_id: storyId,
          total_paths: totalPaths,
          paths_completed: 0,
          endings_discovered: [],
        });

        return {
          storyId,
          totalPaths,
          pathsCompleted: 0,
          endingsDiscovered: [],
          completionPercentage: 0,
          allEndingsBadgeAwarded: false,
        };
      }

      return {
        storyId: data.story_id,
        totalPaths: data.total_paths,
        pathsCompleted: data.paths_completed,
        endingsDiscovered: data.endings_discovered || [],
        completionPercentage: data.total_paths > 0 
          ? (data.paths_completed / data.total_paths) * 100 
          : 0,
        allEndingsBadgeAwarded: data.all_endings_badge_awarded,
      };
    } catch (error) {
      console.error('Error in getPathCompletion:', error);
      return null;
    }
  }

  /**
   * Count total unique paths in a story
   */
  private async countTotalPaths(storyId: string): Promise<number> {
    try {
      // Count ending nodes
      const { count } = await this.supabase
        .from('story_branch_nodes')
        .select('*', { count: 'exact', head: true })
        .eq('story_id', storyId)
        .eq('node_type', 'ending');

      return count || 1;
    } catch (error) {
      return 1;
    }
  }

  /**
   * Record completed path
   */
  async recordCompletedPath(
    userId: string,
    storyId: string,
    pathNodes: string[],
    endingReached: string
  ): Promise<void> {
    try {
      // Record the path
      await this.supabase.from('user_story_paths').insert({
        user_id: userId,
        story_id: storyId,
        path_nodes: pathNodes,
        ending_reached: endingReached,
      });

      // Update completion tracking
      const completion = await this.getPathCompletion(userId, storyId);
      
      if (completion) {
        const newEndings = completion.endingsDiscovered.includes(endingReached)
          ? completion.endingsDiscovered
          : [...completion.endingsDiscovered, endingReached];

        const allEndingsDiscovered = newEndings.length >= completion.totalPaths;

        await this.supabase
          .from('story_path_completions')
          .update({
            paths_completed: completion.pathsCompleted + 1,
            endings_discovered: newEndings,
            all_endings_badge_awarded: allEndingsDiscovered,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('story_id', storyId);

        // Award badge if all endings discovered
        if (allEndingsDiscovered && !completion.allEndingsBadgeAwarded) {
          // Award achievement
          await this.supabase.rpc('award_achievement', {
            p_user_id: userId,
            p_achievement_type: 'all_endings',
            p_story_id: storyId,
          });
        }
      }

      // Update edge traversal counts
      for (let i = 0; i < pathNodes.length - 1; i++) {
        await this.incrementEdgeTraversal(storyId, pathNodes[i], pathNodes[i + 1]);
      }
    } catch (error) {
      console.error('Error recording completed path:', error);
    }
  }

  /**
   * Increment edge traversal count
   */
  private async incrementEdgeTraversal(storyId: string, fromNodeId: string, toNodeId: string): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('story_branch_edges')
        .select('id, traversal_count')
        .eq('story_id', storyId)
        .eq('from_node_id', fromNodeId)
        .eq('to_node_id', toNodeId)
        .single();

      if (data) {
        await this.supabase
          .from('story_branch_edges')
          .update({ traversal_count: data.traversal_count + 1 })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error incrementing edge traversal:', error);
    }
  }

  /**
   * Get choice heatmap for a story
   */
  async getChoiceHeatmap(storyId: string): Promise<ChoiceHeatmapData[]> {
    try {
      const { data, error } = await this.supabase
        .from('choice_heatmap')
        .select(`
          *,
          story_chapters!choice_heatmap_chapter_id_fkey (title)
        `)
        .eq('story_id', storyId)
        .order('chapter_id')
        .order('choice_index');

      if (error) {
        console.error('Error fetching heatmap:', error);
        return [];
      }

      return (data || []).map(h => ({
        chapterId: h.chapter_id,
        choiceIndex: h.choice_index,
        choiceText: '', // Would need to join with choices
        selectionCount: h.selection_count,
        percentage: h.percentage,
      }));
    } catch (error) {
      console.error('Error in getChoiceHeatmap:', error);
      return [];
    }
  }

  /**
   * Update choice heatmap
   */
  async recordChoice(storyId: string, chapterId: string, choiceIndex: number): Promise<void> {
    try {
      // Get current data
      const { data: existing } = await this.supabase
        .from('choice_heatmap')
        .select('*')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId)
        .eq('choice_index', choiceIndex)
        .single();

      if (existing) {
        await this.supabase
          .from('choice_heatmap')
          .update({
            selection_count: existing.selection_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await this.supabase.from('choice_heatmap').insert({
          story_id: storyId,
          chapter_id: chapterId,
          choice_index: choiceIndex,
          selection_count: 1,
          percentage: 0,
        });
      }

      // Recalculate percentages for this chapter
      await this.recalculateHeatmapPercentages(storyId, chapterId);
    } catch (error) {
      console.error('Error recording choice:', error);
    }
  }

  /**
   * Recalculate heatmap percentages
   */
  private async recalculateHeatmapPercentages(storyId: string, chapterId: string): Promise<void> {
    try {
      const { data: choices } = await this.supabase
        .from('choice_heatmap')
        .select('id, selection_count')
        .eq('story_id', storyId)
        .eq('chapter_id', chapterId);

      if (!choices || choices.length === 0) return;

      const total = choices.reduce((sum, c) => sum + c.selection_count, 0);

      for (const choice of choices) {
        const percentage = total > 0 ? (choice.selection_count / total) * 100 : 0;
        await this.supabase
          .from('choice_heatmap')
          .update({ percentage })
          .eq('id', choice.id);
      }
    } catch (error) {
      console.error('Error recalculating percentages:', error);
    }
  }

  /**
   * Get user's completed paths
   */
  async getUserPaths(userId: string, storyId: string): Promise<UserPath[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_story_paths')
        .select('*')
        .eq('user_id', userId)
        .eq('story_id', storyId)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching user paths:', error);
        return [];
      }

      return (data || []).map(p => ({
        id: p.id,
        pathNodes: p.path_nodes,
        endingReached: p.ending_reached,
        completedAt: p.completed_at,
      }));
    } catch (error) {
      console.error('Error in getUserPaths:', error);
      return [];
    }
  }

  /**
   * Get stories with undiscovered endings
   */
  async getStoriesWithUndiscoveredEndings(userId: string, limit: number = 10): Promise<Array<{
    storyId: string;
    storyTitle: string;
    endingsDiscovered: number;
    totalEndings: number;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('story_path_completions')
        .select(`
          *,
          stories!story_path_completions_story_id_fkey (title)
        `)
        .eq('user_id', userId)
        .lt('paths_completed', 'total_paths') // Less than total
        .limit(limit);

      if (error) {
        console.error('Error fetching undiscovered:', error);
        return [];
      }

      return (data || [])
        .filter(d => (d.endings_discovered?.length || 0) < d.total_paths)
        .map(d => ({
          storyId: d.story_id,
          storyTitle: (d.stories as any)?.title || 'Unknown',
          endingsDiscovered: d.endings_discovered?.length || 0,
          totalEndings: d.total_paths,
        }));
    } catch (error) {
      console.error('Error in getStoriesWithUndiscoveredEndings:', error);
      return [];
    }
  }

  private mapNodes(data: any[]): BranchNode[] {
    return data.map(this.mapNode);
  }

  private mapNode(data: any): BranchNode {
    return {
      id: data.id,
      storyId: data.story_id,
      chapterId: data.chapter_id,
      nodeType: data.node_type,
      label: data.label,
      xPosition: data.x_position,
      yPosition: data.y_position,
      metadata: data.metadata || {},
    };
  }

  private mapEdges(data: any[]): BranchEdge[] {
    return data.map(this.mapEdge);
  }

  private mapEdge(data: any): BranchEdge {
    return {
      id: data.id,
      fromNodeId: data.from_node_id,
      toNodeId: data.to_node_id,
      choiceText: data.choice_text,
      traversalCount: data.traversal_count,
    };
  }
}

export const storyBranchingService = new StoryBranchingService();
