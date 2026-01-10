'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gdprService } from '@/services/gdprService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface CookieConsentProps {
  className?: string;
}

export function CookieConsent({ className = '' }: CookieConsentProps) {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already set preferences
    const checkPreferences = async () => {
      try {
        const sessionId = getSessionId();
        const prefs = await gdprService.getCookiePreferences(user?.id || null, sessionId);

        setPreferences({
          essential: prefs.essential,
          analytics: prefs.analytics,
          marketing: prefs.marketing,
          functional: prefs.functional,
        });

        // Only show banner if no preferences set
        if (!prefs.analytics && !prefs.marketing && !prefs.functional) {
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error loading cookie preferences:', error);
        // Show banner on error
        setShowBanner(true);
      }
    };

    checkPreferences();
  }, [user]);

  const getSessionId = (): string => {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const handleAcceptAll = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const newPrefs = {
        essential: true,
        analytics: true,
        marketing: true,
        functional: true,
      };

      await gdprService.updateCookiePreferences(user?.id || null, sessionId, newPrefs);

      // Record consents if user is logged in
      if (user) {
        await Promise.all([
          gdprService.recordConsent(user.id, 'analytics', true),
          gdprService.recordConsent(user.id, 'marketing', true),
          gdprService.recordConsent(user.id, 'personalization', true),
        ]);
      }

      setPreferences(newPrefs);
      setShowBanner(false);
      toast.success('Cookie preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      const newPrefs = {
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      };

      await gdprService.updateCookiePreferences(user?.id || null, sessionId, newPrefs);

      if (user) {
        await Promise.all([
          gdprService.recordConsent(user.id, 'analytics', false),
          gdprService.recordConsent(user.id, 'marketing', false),
        ]);
      }

      setPreferences(newPrefs);
      setShowBanner(false);
      toast.success('Cookie preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      const sessionId = getSessionId();
      await gdprService.updateCookiePreferences(user?.id || null, sessionId, preferences);

      if (user) {
        await Promise.all([
          gdprService.recordConsent(user.id, 'analytics', preferences.analytics),
          gdprService.recordConsent(user.id, 'marketing', preferences.marketing),
        ]);
      }

      setShowBanner(false);
      toast.success('Cookie preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === 'essential') return; // Can't disable essential
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          {!showDetails ? (
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">Cookie Preferences</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies to enhance your experience, analyze site usage, and assist in
                  marketing efforts. You can customize your preferences below.
                </p>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAcceptAll}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    Accept All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRejectAll}
                    disabled={loading}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    Reject All
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetails(true)}
                    className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Customize
                  </motion.button>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Customize Cookies</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Essential Cookies</div>
                    <div className="text-sm text-muted-foreground">
                      Required for the site to function properly
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-sm font-semibold">
                    Always On
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Analytics Cookies</div>
                    <div className="text-sm text-muted-foreground">
                      Help us understand how visitors interact with our site
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => handleToggle('analytics')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Marketing Cookies</div>
                    <div className="text-sm text-muted-foreground">
                      Used to deliver personalized advertisements
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => handleToggle('marketing')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Functional Cookies */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">Functional Cookies</div>
                    <div className="text-sm text-muted-foreground">
                      Enable enhanced functionality and personalization
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={() => handleToggle('functional')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Save Preferences
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBanner(false)}
                  className="px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
