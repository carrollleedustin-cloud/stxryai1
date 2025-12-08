'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserThemes, getActiveTheme, createTheme, setActiveTheme, deleteTheme, getAchievementTiers, getDiscoveryPreferences, getReceivedFeedback, UserUITheme, CharacterRelationship, AchievementTier, DiscoveryPreferences } from '@/services/personalizationService';

export default function PersonalizationStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'themes' | 'relationships' | 'achievements' | 'discovery' | 'feedback'>('themes');
  const [loading, setLoading] = useState(true);

  // State for different features
  const [userThemes, setUserThemes] = useState<UserUITheme[]>([]);
  const [activeThemeData, setActiveThemeData] = useState<UserUITheme | null>(null);
  const [characterRelationships, setCharacterRelationships] = useState<CharacterRelationship[]>([]);
  const [achievementTiers, setAchievementTiers] = useState<AchievementTier[]>([]);
  const [discoveryPrefs, setDiscoveryPrefs] = useState<DiscoveryPreferences | null>(null);
  const [receivedFeedback, setReceivedFeedback] = useState<any[]>([]);

  // Theme creation state
  const [newThemeName, setNewThemeName] = useState('');
  const [selectedColorPalette, setSelectedColorPalette] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#1f2937'
  });

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
        case 'themes':
          const themes = await getUserThemes(user.id);
          setUserThemes(themes || []);
          const active = await getActiveTheme(user.id);
          setActiveThemeData(active);
          break;
        case 'relationships':
          // Note: Requires story_id in production
          break;
        case 'achievements':
          const tiers = await getAchievementTiers();
          setAchievementTiers(tiers || []);
          break;
        case 'discovery':
          const prefs = await getDiscoveryPreferences(user.id);
          setDiscoveryPrefs(prefs);
          break;
        case 'feedback':
          const feedback = await getReceivedFeedback(user.id);
          setReceivedFeedback(feedback || []);
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTheme = async () => {
    if (!user?.id || !newThemeName.trim()) return;

    try {
      const newTheme = await createTheme({
        user_id: user.id,
        theme_name: newThemeName,
        theme_category: 'color_palette',
        color_palette: selectedColorPalette,
        is_active: false
      });

      setUserThemes([newTheme, ...userThemes]);
      setNewThemeName('');
    } catch (error) {
      console.error('Error creating theme:', error);
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    if (!user?.id) return;

    try {
      await setActiveTheme(user.id, themeId);
      loadData();
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    try {
      await deleteTheme(themeId);
      setUserThemes(userThemes.filter(t => t.id !== themeId));
    } catch (error) {
      console.error('Error deleting theme:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access Personalization Studio</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'themes', label: 'UI Themes', icon: '🎨' },
    { id: 'relationships', label: 'Character Map', icon: '🕸️' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'discovery', label: 'Discovery', icon: '🔍' },
    { id: 'feedback', label: 'Feedback', icon: '💝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personalization Studio</h1>
              <p className="text-gray-600 mt-1">Customize your reading experience</p>
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
                    ? 'bg-purple-600 text-white' :'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* UI Themes Tab */}
            {activeTab === 'themes' && (
              <div className="space-y-6">
                {/* Create New Theme */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Create Custom Theme</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme Name</label>
                      <input
                        type="text"
                        value={newThemeName}
                        onChange={(e) => setNewThemeName(e.target.value)}
                        placeholder="My Custom Theme"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Color Palette Picker */}
                    <div className="space-y-3">
                      {Object.entries(selectedColorPalette).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <label className="text-sm text-gray-700 capitalize w-24">{key}</label>
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => setSelectedColorPalette({
                              ...selectedColorPalette,
                              [key]: e.target.value
                            })}
                            className="h-10 w-20 cursor-pointer"
                          />
                          <span className="text-sm text-gray-600 font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreateTheme}
                    disabled={!newThemeName.trim()}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Create Theme
                  </button>
                </div>

                {/* Existing Themes */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Themes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userThemes?.length > 0 ? (
                      userThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className={`border-2 rounded-lg p-4 ${
                            theme.is_active ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{theme.theme_name}</h3>
                            {theme.is_active && (
                              <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">Active</span>
                            )}
                          </div>

                          {/* Color Palette Display */}
                          <div className="flex gap-2 mb-3">
                            {Object.entries(theme.color_palette).map(([key, value]) => (
                              <div
                                key={key}
                                className="w-8 h-8 rounded border border-gray-300"
                                style={{ backgroundColor: value as string }}
                                title={`${key}: ${value}`}
                              />
                            ))}
                          </div>

                          <div className="flex gap-2">
                            {!theme.is_active && (
                              <button
                                onClick={() => handleActivateTheme(theme.id)}
                                className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTheme(theme.id)}
                              disabled={theme.is_active}
                              className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-gray-500 py-8">
                        No themes yet. Create your first one!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Achievement Tiers Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Achievement System</h2>
                <div className="space-y-4">
                  {achievementTiers?.length > 0 ? (
                    achievementTiers.map((tier) => (
                      <div key={tier.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{tier.tier_name}</h3>
                              <span className="text-sm text-gray-600">Level {tier.tier_level}</span>
                            </div>
                          </div>
                          {tier.seasonal_theme && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                              {tier.seasonal_theme}
                            </span>
                          )}
                        </div>
                        
                        {tier.requirements && (
                          <div className="mt-3 text-sm text-gray-700">
                            <span className="font-medium">Requirements:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(tier.requirements).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-gray-600">•</span>
                                  <span>{key}: {String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No achievement tiers configured yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discovery Preferences Tab */}
            {activeTab === 'discovery' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Discovery Preferences</h2>
                {discoveryPrefs ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Favorite Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {discoveryPrefs.favorite_genres?.map((genre, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Preferred Writing Styles</h3>
                      <div className="flex flex-wrap gap-2">
                        {discoveryPrefs.preferred_writing_styles?.map((style, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Emotional Tone Preferences</h3>
                      <div className="flex flex-wrap gap-2">
                        {discoveryPrefs.emotional_tone_preferences?.map((tone, idx) => (
                          <span key={idx} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                            {tone}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Reading Pace</h3>
                      <p className="text-gray-700 capitalize">{discoveryPrefs.reading_pace_preference}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Content Maturity Level</h3>
                      <p className="text-gray-700 capitalize">{discoveryPrefs.content_maturity_level}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No discovery preferences set yet
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Reader Feedback</h2>
                <div className="space-y-4">
                  {receivedFeedback?.length > 0 ? (
                    receivedFeedback.map((feedback) => (
                      <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                            {feedback.giver?.display_name?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-gray-900">
                                {feedback.giver?.display_name || 'Anonymous'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded mb-2">
                              {feedback.feedback_type}
                            </span>
                            {feedback.message && (
                              <p className="text-gray-700 text-sm">{feedback.message}</p>
                            )}
                            {feedback.milestone_achieved && (
                              <div className="mt-2 text-sm text-gray-600">
                                🎉 Milestone: {feedback.milestone_achieved}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      No feedback received yet
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for relationships tab */}
            {activeTab === 'relationships' && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🕸️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Character Relationship Mapper</h3>
                <p className="text-gray-600">Select a story to view character relationships</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}