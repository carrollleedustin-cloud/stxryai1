import { aiStoryAssistantService } from '../aiStoryAssistantService';
import { supabase } from '@/lib/supabase/client';
import * as aiClient from '@/lib/ai/client';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

// Mock AI Client
jest.mock('@/lib/ai/client', () => ({
  generateCompletion: jest.fn(),
}));

describe('AIStoryAssistantService', () => {
  const userId = 'user-123';
  const storyId = 'story-456';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  describe('generateSuggestions', () => {
    it('should generate writing suggestions and store them', async () => {
      const content = 'Once upon a time...';
      const mockAIResponse = {
        content: JSON.stringify([
          {
            suggestionType: 'plot',
            originalText: 'Once upon a time',
            suggestedText: 'In a galaxy far away',
            reasoning: 'More engaging',
            confidenceScore: 0.9,
          },
        ]),
        usage: { totalTokens: 100 },
      };

      (aiClient.generateCompletion as jest.Mock).mockResolvedValue(mockAIResponse);
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'sugg-1', user_id: userId, status: 'pending' }],
            error: null,
          }),
        }),
      });

      const suggestions = await aiStoryAssistantService.generateSuggestions(userId, content, { storyId });

      expect(aiClient.generateCompletion).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('ai_writing_suggestions');
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].id).toBe('sugg-1');
    });

    it('should return empty array if AI keys are missing', async () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;

      const suggestions = await aiStoryAssistantService.generateSuggestions(userId, 'content', {});
      expect(suggestions).toEqual([]);
    });
  });

  describe('runPlotDoctorAnalysis', () => {
    it('should run plot analysis and store results', async () => {
      const content = 'Full story content...';
      const mockAIResponse = {
        content: JSON.stringify({
          issues: [{ type: 'pacing', severity: 'medium', description: 'Too slow' }],
          suggestions: [{ type: 'action', description: 'Add a chase' }],
          strengths: [{ aspect: 'character', description: 'Strong protagonist' }],
          overallScore: 85,
          overallFeedback: 'Good start',
        }),
        usage: { totalTokens: 200 },
      };

      (aiClient.generateCompletion as jest.Mock).mockResolvedValue(mockAIResponse);
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'analysis-1', user_id: userId, story_id: storyId },
              error: null,
            }),
          }),
        }),
      });

      const analysis = await aiStoryAssistantService.runPlotDoctorAnalysis(userId, storyId, 'full_story', content);

      expect(analysis.id).toBe('analysis-1');
      expect(aiClient.generateCompletion).toHaveBeenCalled();
    });
  });

  describe('generateIdeas', () => {
    it('should generate creative ideas', async () => {
      const mockAIResponse = {
        content: JSON.stringify([
          { title: 'Space Cats', description: 'Cats in space', keyElements: ['lasers'] },
        ]),
        usage: { totalTokens: 50 },
      };

      (aiClient.generateCompletion as jest.Mock).mockResolvedValue(mockAIResponse);
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'idea-1', user_id: userId, generation_type: 'story_concept' },
              error: null,
            }),
          }),
        }),
      });

      const ideas = await aiStoryAssistantService.generateIdeas(userId, 'story_concept', 'Space adventures');

      expect(ideas.id).toBe('idea-1');
      expect(aiClient.generateCompletion).toHaveBeenCalled();
    });
  });
});
