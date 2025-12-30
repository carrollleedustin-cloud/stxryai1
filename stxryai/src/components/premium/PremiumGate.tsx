'use client';

/**
 * Premium Gate Component
 * Blocks access to premium features for non-premium users
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessPremiumFeature } from '@/lib/auth/accessControl';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { InteractiveButton } from '@/components/ui/MicroInteractions';

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function PremiumGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: PremiumGateProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const accessCheck = canAccessPremiumFeature(profile, feature);
  
  if (accessCheck.allowed) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (!showUpgradePrompt) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl border-2 border-purple-500/30 text-center"
    >
      <div className="mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🔒
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Premium Feature Locked</h3>
        <p className="text-ghost-400 mb-4">{accessCheck.reason || 'This feature requires a premium subscription.'}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <InteractiveButton
          onClick={() => router.push('/pricing')}
          variant="primary"
          size="lg"
          className="px-6 py-3"
        >
          <Icon name="SparklesIcon" className="mr-2" size={18} />
          Upgrade to Premium
        </InteractiveButton>
        <InteractiveButton
          onClick={() => router.push('/user-dashboard')}
          variant="outline"
          size="lg"
          className="px-6 py-3"
        >
          Go to Dashboard
        </InteractiveButton>
      </div>
      
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-sm text-ghost-500">
          Premium features include: AI Voice Narration, Story Export, AI Story Generator, and more!
        </p>
      </div>
    </motion.div>
  );
}

