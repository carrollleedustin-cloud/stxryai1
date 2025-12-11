'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_install_dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl border border-white/20">
            <div className="flex items-start gap-4">
              <div className="text-5xl">📱</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Install StxryAI App</h3>
                <p className="text-white/90 text-sm mb-4">
                  Get the full experience! Install our app for offline reading, push notifications, and faster loading.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="px-6 py-2.5 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-6 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
