'use client';

import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

export interface StoryChoice {
  id: string;
  text: string;
  description?: string;
  consequences?: string[];
  icon?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isPremium?: boolean;
  isRecommended?: boolean;
  popularityPercentage?: number;
}

interface StoryChoiceCardProps {
  choice: StoryChoice;
  index: number;
  onSelect: (choiceId: string) => void;
  isSelected?: boolean;
  showStats?: boolean;
  disabled?: boolean;
  animate?: boolean;
}

export default function StoryChoiceCard({
  choice,
  index,
  onSelect,
  isSelected = false,
  showStats = true,
  disabled = false,
  animate = true
}: StoryChoiceCardProps) {
  const difficultyConfig = {
    easy: { color: 'text-green-500', label: 'Easy Path', icon: 'CheckCircleIcon' },
    medium: { color: 'text-yellow-500', label: 'Moderate Path', icon: 'ExclamationCircleIcon' },
    hard: { color: 'text-red-500', label: 'Challenging Path', icon: 'FireIcon' }
  };

  const difficulty = choice.difficulty || 'medium';
  const difficultyInfo = difficultyConfig[difficulty];

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={() => !disabled && onSelect(choice.id)}
      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
          : disabled
          ? 'border-border bg-muted opacity-50 cursor-not-allowed'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-lg'
      }`}
    >
      {/* Choice Number Badge */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
        {index + 1}
      </div>

      {/* Premium Badge */}
      {choice.isPremium && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
          className="absolute -top-3 -right-3 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center gap-1 shadow-lg"
        >
          <Icon name="SparklesIcon" size={14} className="text-white" />
          <span className="text-xs font-bold text-white">PRO</span>
        </motion.div>
      )}

      {/* Recommended Badge */}
      {choice.isRecommended && !choice.isPremium && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="absolute -top-3 -right-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center gap-1 shadow-lg"
        >
          <Icon name="StarIcon" size={14} variant="solid" className="text-white" />
          <span className="text-xs font-bold text-white">AI Pick</span>
        </motion.div>
      )}

      {/* Choice Icon */}
      {choice.icon && (
        <div className="mb-4 text-4xl">{choice.icon}</div>
      )}

      {/* Choice Text */}
      <h3 className="text-lg font-bold text-foreground mb-2">{choice.text}</h3>

      {/* Description */}
      {choice.description && (
        <p className="text-sm text-muted-foreground mb-4">{choice.description}</p>
      )}

      {/* Consequences Preview */}
      {choice.consequences && choice.consequences.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Possible Outcomes:
          </p>
          <div className="space-y-1">
            {choice.consequences.map((consequence, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-foreground">
                <Icon name="ChevronRightIcon" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span>{consequence}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty & Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <Icon name={difficultyInfo.icon} size={16} className={difficultyInfo.color} />
          <span className={`text-xs font-medium ${difficultyInfo.color}`}>
            {difficultyInfo.label}
          </span>
        </div>

        {/* Popularity */}
        {showStats && choice.popularityPercentage !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Icon name="UserGroupIcon" size={16} className="text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {choice.popularityPercentage}% chose this
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-4 right-4"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Icon name="CheckIcon" size={20} className="text-primary-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}