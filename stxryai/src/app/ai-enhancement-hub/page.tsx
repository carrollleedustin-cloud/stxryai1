'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPromptTemplates, getPromptChains, getReadingRecaps, getWritingPrompts, createPromptTemplate, AIPromptTemplate, DynamicPromptChain, ProceduralContent, StoryPathAnalytics, ReadingJourneyRecap, StoryTranslation, GlossaryEntry, WritingPrompt } from '@/services/aiEnhancementService';

export default function AIEnhancementHub() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'prompts' | 'chains' | 'procedural' | 'analytics' | 'recaps' | 'translations' | 'glossary' | 'writing'>('prompts');
  const [loading, setLoading] = useState(true);

  // State for different features
  const [promptTemplates, setPromptTemplates] = useState<AIPromptTemplate[]>([]);
  const [promptChains, setPromptChains] = useState<DynamicPromptChain[]>([]);
  const [proceduralContent, setProceduralContent] = useState<ProceduralContent[]>([]);
  const [storyAnalytics, setStoryAnalytics] = useState<StoryPathAnalytics[]>([]);
  const [readingRecaps, setReadingRecaps] = useState<ReadingJourneyRecap[]>([]);
  const [translations, setTranslations] = useState<StoryTranslation[]>([]);
  const [glossaryEntries, setGlossaryEntries] = useState<GlossaryEntry[]>([]);
  const [writingPrompts, setWritingPrompts] = useState<WritingPrompt[]>([]);

  // Creativity level for new prompts
  const [creativityLevel, setCreativityLevel] = useState(0.7);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'prompts':
          const templates = await getPromptTemplates(user.id);
          setPromptTemplates(templates || []);
          break;
        case 'chains':
          const chains = await getPromptChains(user.id);
          setPromptChains(chains || []);
          break;
        case 'procedural':
          // Note: Requires story_id in production
          break;
        case 'analytics':
          // Note: Requires story_id in production
          break;
        case 'recaps':
          const recaps = await getReadingRecaps(user.id);
          setReadingRecaps(recaps || []);
          break;
        case 'translations':
          // Note: Requires story_id in production
          break;
        case 'glossary':
          // Note: Requires story_id in production
          break;
        case 'writing':
          const prompts = await getWritingPrompts(user.id);
          setWritingPrompts(prompts || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromptTemplate = async () => {
    if (!user?.id) return;

    try {
      // This is a demo - in production, get story_id from context
      const newTemplate = await createPromptTemplate({
        user_id: user.id,
        story_id: '11111111-1111-1111-1111-111111111111', // Demo story ID
        prompt_category: 'contextual',
        template_name: 'New Prompt Template',
        prompt_text: 'Enter your prompt text here...',
        creativity_level: creativityLevel,
        context_variables: {}
      });

      setPromptTemplates([newTemplate, ...promptTemplates]);
    } catch (error) {
      console.error('Error creating prompt template:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access AI Enhancement Hub</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'prompts', label: 'AI Prompts', icon: '🎯' },
    { id: 'chains', label: 'Prompt Chains', icon: '⛓️' },
    { id: 'procedural', label: 'Procedural Content', icon: '🎨' },
    { id: 'analytics', label: 'Predictive Analytics', icon: '📊' },
    { id: 'recaps', label: 'Reading Recaps', icon: '📖' },
    { id: 'translations', label: 'Translations', icon: '🌍' },
    { id: 'glossary', label: 'Glossary', icon: '📚' },
    { id: 'writing', label: 'Writing Prompts', icon: '✍️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Enhancement Hub</h1>
              <p className="text-gray-600 mt-1">Advanced AI features for enhanced storytelling</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">User: {user.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* AI Prompts Tab */}
            {activeTab === 'prompts' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Contextual AI Prompts</h2>
                    <button
                      onClick={handleCreatePromptTemplate}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Create New Prompt
                    </button>
                  </div>

                  {/* Creativity Level Control */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Creativity Level: {creativityLevel.toFixed(2)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={creativityLevel}
                      onChange={(e) => setCreativityLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conservative</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  {/* Prompt Templates List */}
                  <div className="space-y-4">
                    {promptTemplates?.length > 0 ? (
                      promptTemplates.map((template) => (
                        <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{template.template_name}</h3>
                              <span className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded mt-1">
                                {template.prompt_category}
                              </span>
                            </div>
                            <div className="text-right text-sm text-gray-600">
                              <div>Used: {template.usage_count} times</div>
                              <div>Success: {template.success_rate.toFixed(1)}%</div>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm mt-2">{template.prompt_text}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Creativity:</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${template.creativity_level * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{template.creativity_level.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No prompt templates yet. Create your first one!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Chains Tab */}
            {activeTab === 'chains' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Dynamic Prompt Chains</h2>
                <div className="space-y-4">
                  {promptChains?.length > 0 ? (
                    promptChains.map((chain) => (
                      <div key={chain.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{chain.chain_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            chain.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {chain.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="text-sm text-gray-600">
                            Current Step: {chain.current_step} / {chain.prompt_sequence?.steps?.length || 0}
                          </div>
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {chain.prompt_sequence?.steps?.map((step: string, idx: number) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 text-xs rounded ${
                                  idx < chain.current_step
                                    ? 'bg-green-100 text-green-800'
                                    : idx === chain.current_step
                                    ? 'bg-blue-100 text-blue-800' :'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No prompt chains configured yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reading Recaps Tab */}
            {activeTab === 'recaps' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Personalized Reading Recaps</h2>
                <div className="space-y-4">
                  {readingRecaps?.length > 0 ? (
                    readingRecaps.map((recap) => (
                      <div key={recap.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                            {recap.recap_type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(recap.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">{recap.recap_content}</p>
                        
                        {/* Moral Alignments */}
                        {recap.moral_alignments && Object.keys(recap.moral_alignments).length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Moral Alignments</h4>
                            <div className="grid grid-cols-3 gap-3">
                              {Object.entries(recap.moral_alignments).map(([trait, value]) => (
                                <div key={trait}>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="capitalize text-gray-600">{trait}</span>
                                    <span className="font-semibold text-gray-900">{value as number}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                      style={{ width: `${value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Choice History Preview */}
                        {recap.choice_history && recap.choice_history.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Decisions</h4>
                            <div className="flex gap-2 flex-wrap">
                              {recap.choice_history.slice(0, 3).map((choice: any, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {choice.choice}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No reading recaps available yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Writing Prompts Tab */}
            {activeTab === 'writing' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Guided Writing Prompts</h2>
                <div className="space-y-4">
                  {writingPrompts?.length > 0 ? (
                    writingPrompts.map((prompt) => (
                      <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium">
                            {prompt.prompt_type}
                          </span>
                          {prompt.genre_specific && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                              {prompt.genre_specific}
                            </span>
                          )}
                        </div>
                        
                        {prompt.worldbuilding_focus && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Worldbuilding Focus</h4>
                            <p className="text-sm text-gray-700">{prompt.worldbuilding_focus}</p>
                          </div>
                        )}

                        {prompt.character_motivation_theme && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Character Motivation</h4>
                            <p className="text-sm text-gray-700">{prompt.character_motivation_theme}</p>
                          </div>
                        )}

                        {prompt.scene_construction_guidance && (
                          <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Scene Construction</h4>
                            <p className="text-sm text-gray-700">{prompt.scene_construction_guidance}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No writing prompts generated yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['procedural', 'analytics', 'translations', 'glossary'].includes(activeTab) && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">
                  {activeTab === 'procedural' && '🎨'}
                  {activeTab === 'analytics' && '📊'}
                  {activeTab === 'translations' && '🌍'}
                  {activeTab === 'glossary' && '📚'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === 'procedural' && 'Procedural Content Generation'}
                  {activeTab === 'analytics' && 'Predictive Story Analytics'}
                  {activeTab === 'translations' && 'Multilingual Translations'}
                  {activeTab === 'glossary' && 'Interactive Glossary'}
                </h3>
                <p className="text-gray-600">
                  Select a story to view {activeTab} features
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}