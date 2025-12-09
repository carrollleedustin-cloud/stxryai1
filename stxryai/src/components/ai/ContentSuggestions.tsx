'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { GeneratedContent } from '@/lib/ai/storyGenerationAssistant';

interface ContentSuggestionsProps {
  context: string;
  onApplySuggestion: (content: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export default function ContentSuggestions({
  context,
  onApplySuggestion,
  onRefresh,
  loading = false
}: ContentSuggestionsProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'dialogue' | 'description' | 'choice' | 'twist'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock suggestions (in production, would come from AI API)
  const suggestions: (GeneratedContent & { id: string })[] = [
    {
      id: '1',
      type: 'dialogue',
      content: `Character A: "We can't keep running forever."\nCharacter B: "Then we make our stand here."`,
      alternatives: [
        `Character A: "How much longer can we keep this up?"\nCharacter B: "As long as it takes."`
      ],
      confidence: 0.85,
      tags: ['dialogue', 'tension', 'conflict']
    },
    {
      id: '2',
      type: 'description',
      content: 'The ancient temple loomed before them, its weathered stone walls covered in mysterious glyphs that seemed to pulse with an otherworldly energy.',
      alternatives: [
        'Before them stood the temple, its age evident in every crack and weathered surface, yet somehow still radiating an aura of power.'
      ],
      confidence: 0.78,
      tags: ['description', 'setting', 'atmosphere']
    },
    {
      id: '3',
      type: 'choice',
      content: `• Enter the temple through the main entrance\n• Search for a hidden side entrance\n• Wait and observe before making a move`,
      alternatives: [
        `• Rush in without hesitation\n• Carefully examine the entrance for traps\n• Return and gather more information`
      ],
      confidence: 0.82,
      tags: ['choice', 'decision', 'strategy']
    },
    {
      id: '4',
      type: 'twist',
      content: 'The artifact they\'ve been seeking is actually a key to prevent the catastrophe, not cause it.',
      alternatives: [
        'Their trusted mentor has been manipulating events from the beginning.',
        'The protagonist discovers they\'re connected to the ancient civilization.'
      ],
      confidence: 0.70,
      tags: ['plot-twist', 'revelation', 'surprise']
    }
  ];

  const filteredSuggestions = selectedType === 'all'
    ? suggestions
    : suggestions.filter(s => s.type === selectedType);

  const suggestionTypes = [
    { id: 'all', label: 'All', icon: 'SparklesIcon' },
    { id: 'dialogue', label: 'Dialogue', icon: 'ChatBubbleLeftRightIcon' },
    { id: 'description', label: 'Description', icon: 'DocumentTextIcon' },
    { id: 'choice', label: 'Choices', icon: 'ArrowPathIcon' },
    { id: 'twist', label: 'Twists', icon: 'BoltIcon' }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dialogue': return 'from-blue-500 to-cyan-500';
      case 'description': return 'from-purple-500 to-pink-500';
      case 'choice': return 'from-green-500 to-emerald-500';
      case 'twist': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dialogue': return '💬';
      case 'description': return '📝';
      case 'choice': return '🔀';
      case 'twist': return '⚡';
      default: return '✨';
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="SparklesIcon" size={20} className="text-purple-500" />
            <h3 className="text-lg font-bold text-foreground">AI Suggestions</h3>
          </div>
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              disabled={loading}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh suggestions"
            >
              <Icon name="ArrowPathIcon" size={20} className="text-muted-foreground" />
            </motion.button>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated content based on your story context
        </p>
      </div>

      {/* Type Filter */}
      <div className="border-b border-border p-3 bg-muted/30">
        <div className="flex gap-2 overflow-x-auto">
          {suggestionTypes.map((type) => (
            <motion.button
              key={type.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedType(type.id as typeof selectedType)}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedType === type.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon name={type.icon} size={14} />
              {type.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="ArrowPathIcon" size={32} className="text-primary" />
            </motion.div>
            <span className="ml-3 text-muted-foreground">Generating suggestions...</span>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="InformationCircleIcon" size={32} className="mx-auto mb-2 opacity-50" />
            <p>No suggestions available</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-muted/50 border border-border rounded-lg overflow-hidden"
              >
                {/* Suggestion Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getTypeColor(suggestion.type)} flex items-center justify-center text-lg`}>
                        {getTypeIcon(suggestion.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground capitalize">{suggestion.type}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Icon name="SparklesIcon" size={12} className="text-yellow-500" />
                            <span className="text-xs font-medium text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="bg-card border border-border rounded-lg p-3 mb-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
                      {suggestion.content}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {suggestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onApplySuggestion(suggestion.content)}
                      className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="CheckIcon" size={16} />
                      Apply
                    </motion.button>

                    {suggestion.alternatives && suggestion.alternatives.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                        className="px-3 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
                      >
                        <Icon name="ArrowsRightLeftIcon" size={16} />
                        {suggestion.alternatives.length}
                        <Icon
                          name="ChevronDownIcon"
                          size={16}
                          className={`transition-transform ${expandedId === suggestion.id ? 'rotate-180' : ''}`}
                        />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                      aria-label="More options"
                    >
                      <Icon name="EllipsisVerticalIcon" size={16} className="text-muted-foreground" />
                    </motion.button>
                  </div>
                </div>

                {/* Alternatives */}
                <AnimatePresence>
                  {expandedId === suggestion.id && suggestion.alternatives && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border overflow-hidden"
                    >
                      <div className="p-4 bg-card/50 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Alternative Versions
                        </p>
                        {suggestion.alternatives.map((alt, idx) => (
                          <div key={idx} className="bg-muted/50 border border-border rounded-lg p-3">
                            <p className="text-sm text-foreground whitespace-pre-wrap font-mono mb-2">
                              {alt}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onApplySuggestion(alt)}
                              className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-lg font-medium hover:bg-primary/30 transition-colors"
                            >
                              Apply This Version
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          💡 Tip: These suggestions are AI-generated. Feel free to edit them to match your style!
        </p>
      </div>
    </div>
  );
}
