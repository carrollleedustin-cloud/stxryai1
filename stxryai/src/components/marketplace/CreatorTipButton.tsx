'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { marketplaceService } from '@/services/marketplaceService';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'react-hot-toast';

interface CreatorTipButtonProps {
  creatorId: string;
  storyId?: string;
  className?: string;
}

const TIP_AMOUNTS = [5, 10, 25, 50, 100];

export function CreatorTipButton({
  creatorId,
  storyId,
  className = '',
}: CreatorTipButtonProps) {
  const { user } = useAuth();
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [tipping, setTipping] = useState(false);

  const handleTip = async () => {
    if (!user || tipping) return;

    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a tip amount');
      return;
    }

    try {
      setTipping(true);

      const tip = await marketplaceService.createTip(
        user.id,
        creatorId,
        amount,
        storyId,
        message || undefined
      );

      // TODO: Integrate with Stripe payment processing
      await marketplaceService.updateTipStatus(tip.id, `pi_${Date.now()}`, 'succeeded');

      toast.success(`Tip of $${amount.toFixed(2)} sent! Thank you for supporting creators! 🎉`);
      setShowTipModal(false);
      setSelectedAmount(null);
      setCustomAmount('');
      setMessage('');
    } catch (error: any) {
      console.error('Tip failed:', error);
      toast.error(error.message || 'Failed to send tip');
    } finally {
      setTipping(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <motion.button
        onClick={() => setShowTipModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium ${className}`}
      >
        <Icon name="HeartIcon" size={18} />
        <span>Tip Creator</span>
      </motion.button>

      <AnimatePresence>
        {showTipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border-2 border-border rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <span>💝</span>
                  Tip Creator
                </h3>
                <button
                  onClick={() => setShowTipModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Show your appreciation! Tips go directly to the creator (5% platform fee).
              </p>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {TIP_AMOUNTS.map((amount) => (
                  <motion.button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      selectedAmount === amount
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Leave a message for the creator..."
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTipModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleTip}
                  disabled={tipping || (!selectedAmount && !customAmount)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tipping ? 'Sending...' : 'Send Tip'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


