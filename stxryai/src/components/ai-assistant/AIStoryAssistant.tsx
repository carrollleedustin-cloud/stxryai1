'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  aiStoryAssistantService,
  type AIWritingSuggestion,
  type PlotDoctorAnalysis,
  type AIIdeaGeneration,
} from '@/services/aiStoryAssistantService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface AIStoryAssistantProps {
  storyId?: string;
  chapterId?: string;
  className?: string;
}

export function AIStoryAssistant({ storyId, chapterId, className = '' }: AIStoryAssistantProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'suggestions' | 'plot-doctor' | 'ideas'>(
    'suggestions'
  );
  const [suggestions, setSuggestions] = useState<AIWritingSuggestion[]>([]);
  const [analyses, setAnalyses] = useState<PlotDoctorAnalysis[]>([]);
  const [ideas, setIdeas] = useState<AIIdeaGeneration[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [ideaType, setIdeaType] = useState<AIIdeaGeneration['generationType']>('story_concept');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, activeTab, storyId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      switch (activeTab) {
        case 'suggestions':
          const suggestionsData = await aiStoryAssistantService.getUserSuggestions(
            user.id,
            storyId
          );
          setSuggestions(suggestionsData);
          break;
        case 'plot-doctor':
          if (storyId) {
            const analysesData = await aiStoryAssistantService.getPlotAnalyses(user.id, storyId);
            setAnalyses(analysesData);
          }
          break;
        case 'ideas':
          const ideasData = await aiStoryAssistantService.getUserIdeas(user.id);
          setIdeas(ideasData);
          break;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunPlotDoctor = async () => {
    if (!user || !storyId || analyzing) return;

    try {
      setAnalyzing(true);
      const analysis = await aiStoryAssistantService.runPlotDoctorAnalysis(
        user.id,
        storyId,
        'full_story',
        'Story content here' // Would get actual story content
      );
      toast.success('Plot Doctor analysis complete!');
      loadData();
    } catch (error: any) {
      console.error('Plot Doctor failed:', error);
      toast.error(error.message || 'Failed to run Plot Doctor');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!user || generating) return;

    try {
      setGenerating(true);
      const idea = await aiStoryAssistantService.generateIdeas(
        user.id,
        ideaType,
        ideaPrompt || undefined,
        {}
      );
      toast.success('Ideas generated!');
      setIdeaPrompt('');
      loadData();
    } catch (error: any) {
      console.error('Idea generation failed:', error);
      toast.error(error.message || 'Failed to generate ideas');
    } finally {
      setGenerating(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      await aiStoryAssistantService.acceptSuggestion(suggestionId);
      toast.success('Suggestion accepted!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept suggestion');
    }
  };

  const handleRejectSuggestion = async (suggestionId: string) => {
    try {
      await aiStoryAssistantService.rejectSuggestion(suggestionId);
      toast.success('Suggestion rejected');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject suggestion');
    }
  };

  if (!user) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">Please log in to use AI Story Assistant</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Icon name="SparklesIcon" size={28} />
          AI Story Assistant
        </h2>
        <p className="text-muted-foreground">Get AI-powered writing help and suggestions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['suggestions', 'plot-doctor', 'ideas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">Writing Suggestions</h3>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              Generate Suggestions
            </button>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">
                No suggestions yet. Generate some to get started!
              </p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                        {suggestion.suggestionType}
                      </span>
                      {suggestion.confidenceScore && (
                        <span className="text-sm text-muted-foreground">
                          {Math.round(suggestion.confidenceScore * 100)}% confidence
                        </span>
                      )}
                    </div>
                    {suggestion.originalText && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground mb-1">Original:</p>
                        <p className="text-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {suggestion.originalText}
                        </p>
                      </div>
                    )}
                    {suggestion.suggestedText && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Suggestion:</p>
                        <p className="text-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                          {suggestion.suggestedText}
                        </p>
                      </div>
                    )}
                    {suggestion.reasoning && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        {suggestion.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {suggestion.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-foreground rounded-lg font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {suggestion.status === 'accepted' && (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                      Accepted
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Plot Doctor Tab */}
      {activeTab === 'plot-doctor' && (
        <div className="space-y-4">
          {!storyId ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">Select a story to run Plot Doctor analysis</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-foreground">Plot Doctor</h3>
                <motion.button
                  onClick={handleRunPlotDoctor}
                  disabled={analyzing}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Run Analysis'}
                </motion.button>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                  ))}
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
                  <Icon
                    name="BeakerIcon"
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">
                    No analyses yet. Run Plot Doctor to analyze your story!
                  </p>
                </div>
              ) : (
                analyses.map((analysis, index) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card border-2 border-border rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-foreground mb-2 capitalize">
                          {analysis.analysisType.replace(/_/g, ' ')} Analysis
                        </h4>
                        {analysis.overallScore && (
                          <div className="text-2xl font-bold text-foreground mb-2">
                            {Math.round(analysis.overallScore * 100)}/100
                          </div>
                        )}
                        {analysis.overallFeedback && (
                          <p className="text-foreground mb-4">{analysis.overallFeedback}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Issues Found</div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {analysis.issueCount}
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Suggestions</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {analysis.suggestionCount}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Strengths</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {analysis.strengthCount}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="space-y-4">
          <div className="bg-card border-2 border-border rounded-xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Generate Ideas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Idea Type</label>
                <select
                  value={ideaType}
                  onChange={(e) => setIdeaType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="story_concept">Story Concept</option>
                  <option value="character">Character</option>
                  <option value="plot_twist">Plot Twist</option>
                  <option value="world_building">World Building</option>
                  <option value="dialogue">Dialogue</option>
                  <option value="scene">Scene</option>
                  <option value="title">Title</option>
                  <option value="synopsis">Synopsis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Prompt (Optional)
                </label>
                <textarea
                  value={ideaPrompt}
                  onChange={(e) => setIdeaPrompt(e.target.value)}
                  placeholder="Describe what kind of idea you're looking for..."
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                />
              </div>
              <motion.button
                onClick={handleGenerateIdeas}
                disabled={generating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {generating ? 'Generating Ideas...' : 'Generate Ideas'}
              </motion.button>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12 bg-card border-2 border-border rounded-xl">
              <p className="text-muted-foreground">
                No ideas generated yet. Create some to get started!
              </p>
            </div>
          ) : (
            ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border-2 border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium capitalize">
                        {idea.generationType.replace(/_/g, ' ')}
                      </span>
                      {idea.isUsed && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                          Used
                        </span>
                      )}
                    </div>
                    {idea.prompt && (
                      <p className="text-sm text-muted-foreground mb-2">Prompt: {idea.prompt}</p>
                    )}
                    {idea.generatedIdeas.length > 0 && (
                      <div className="space-y-2">
                        {idea.generatedIdeas.map((genIdea: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 ${
                              idea.selectedIdeaIndex === idx
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-gray-50 dark:bg-gray-900'
                            }`}
                          >
                            <p className="text-foreground">{genIdea.text || genIdea}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
