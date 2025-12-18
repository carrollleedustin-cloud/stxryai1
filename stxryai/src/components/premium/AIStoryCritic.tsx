'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';
import { aiService } from '@/lib/api';

interface StoryAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  pacing: {
    score: number;
    feedback: string;
  };
  character: {
    score: number;
    feedback: string;
  };
  plot: {
    score: number;
    feedback: string;
  };
  dialogue: {
    score: number;
    feedback: string;
  };
  grammar: {
    score: number;
    issues: string[];
  };
}

interface AIStoryCriticProps {
  storyContent: string;
  onAnalysisComplete?: (analysis: StoryAnalysis) => void;
}

export function AIStoryCritic({ storyContent, onAnalysisComplete }: AIStoryCriticProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StoryAnalysis | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const analyzeStory = async () => {
    if (!storyContent.trim()) return;

    setIsAnalyzing(true);
    try {
      const prompt = `Analyze this story and provide detailed feedback:
${storyContent}

Provide:
1. Overall score (0-100)
2. Strengths (3-5 items)
3. Weaknesses (3-5 items)
4. Suggestions for improvement
5. Pacing analysis
6. Character development analysis
7. Plot structure analysis
8. Dialogue quality analysis
9. Grammar and style issues`;

      // TODO: Replace with actual AI analysis
      // const result = await aiService.analyzeStory(storyContent);
      
      // Mock analysis
      setTimeout(() => {
        const mockAnalysis: StoryAnalysis = {
          overallScore: 78,
          strengths: [
            'Strong character development',
            'Engaging plot twists',
            'Vivid descriptions',
            'Good pacing',
          ],
          weaknesses: [
            'Some dialogue feels forced',
            'Pacing slows in middle chapters',
            'Could use more character backstory',
          ],
          suggestions: [
            'Add more internal monologue',
            'Vary sentence structure',
            'Deepen character motivations',
            'Tighten middle section',
          ],
          pacing: {
            score: 75,
            feedback: 'Good overall pacing, but middle chapters could be tightened',
          },
          character: {
            score: 82,
            feedback: 'Characters are well-developed with clear motivations',
          },
          plot: {
            score: 80,
            feedback: 'Plot is engaging with good twists, but some loose ends',
          },
          dialogue: {
            score: 70,
            feedback: 'Dialogue is natural but could be more distinctive per character',
          },
          grammar: {
            score: 85,
            issues: ['Minor punctuation issues', 'Some run-on sentences'],
          },
        };
        setAnalysis(mockAnalysis);
        onAnalysisComplete?.(mockAnalysis);
        setIsAnalyzing(false);
      }, 3000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setIsAnalyzing(false);
    }
  };

  const categories = [
    { id: 'pacing', label: 'Pacing', icon: '⏱️', score: analysis?.pacing.score },
    { id: 'character', label: 'Character', icon: '👤', score: analysis?.character.score },
    { id: 'plot', label: 'Plot', icon: '📖', score: analysis?.plot.score },
    { id: 'dialogue', label: 'Dialogue', icon: '💬', score: analysis?.dialogue.score },
    { id: 'grammar', label: 'Grammar', icon: '✍️', score: analysis?.grammar.score },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <span>🎯</span>
            AI Story Critic
          </h2>
          <p className="text-muted-foreground">Get detailed AI-powered feedback on your story</p>
        </div>
        <motion.button
          onClick={analyzeStory}
          disabled={isAnalyzing || !storyContent.trim()}
          whileHover={!isAnalyzing ? { scale: 1.05 } : {}}
          whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Analyzing...
            </>
          ) : (
            <>
              <Icon name="SparklesIcon" size={20} />
              Analyze Story
            </>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Score */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Overall Score</h3>
                <div className="text-right">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(analysis.overallScore)} bg-clip-text text-transparent`}
                  >
                    {analysis.overallScore}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </div>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getScoreColor(analysis.overallScore)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.overallScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-foreground mb-1">{category.label}</div>
                  {category.score !== undefined && (
                    <div className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(category.score)} bg-clip-text text-transparent`}>
                      {category.score}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="CheckCircleIcon" size={20} className="text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Icon name="ExclamationTriangleIcon" size={20} className="text-red-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <span className="text-red-600 mt-1">!</span>
                      <span>{weakness}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="LightBulbIcon" size={20} className="text-blue-600" />
                Suggestions
              </h3>
              <ul className="space-y-2">
                {analysis.suggestions.map((suggestion, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="text-blue-600 mt-1">💡</span>
                    <span>{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Category Details */}
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card border border-border rounded-xl"
              >
                <h3 className="font-bold text-foreground mb-4">
                  {categories.find((c) => c.id === selectedCategory)?.label} Analysis
                </h3>
                <p className="text-foreground">
                  {selectedCategory === 'pacing' && analysis.pacing.feedback}
                  {selectedCategory === 'character' && analysis.character.feedback}
                  {selectedCategory === 'plot' && analysis.plot.feedback}
                  {selectedCategory === 'dialogue' && analysis.dialogue.feedback}
                  {selectedCategory === 'grammar' && (
                    <div>
                      <p className="mb-2">{analysis.grammar.feedback}</p>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.grammar.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

