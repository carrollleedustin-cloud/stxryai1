'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, BookOpen, User, Settings, 
  LogOut, LogIn, UserPlus, Sparkles, Compass 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PrismPanel } from '@/components/ui/prism/PrismPanel';
import { PrismButton } from '@/components/ui/prism/PrismButton';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/', show: true },
    { icon: BookOpen, label: 'Stories', path: '/story-library', show: true },
    { icon: Compass, label: 'Explore', path: '/explore', show: true },
    { icon: User, label: 'Dashboard', path: '/user-dashboard', show: !!user },
    { icon: Settings, label: 'Settings', path: '/settings', show: !!user },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push('/');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.5)] text-white hover:scale-110 transition-all duration-300"
        aria-label="Toggle menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden p-4"
            >
              <PrismPanel tone="glass" className="h-full flex flex-col overflow-hidden !rounded-2xl border-white/10 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-white font-display tracking-tight">StxryAI</h2>
                        <p className="text-xs text-slate-400">Interactive Stories</p>
                      </div>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-inner">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white">
                          {user.display_name || user.email}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto scrollbar-modern p-4 space-y-2 relative z-10">
                  {navItems
                    .filter(item => item.show)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.path;
                      return (
                        <motion.button
                          key={item.path}
                          onClick={() => handleNavigation(item.path)}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                            isActive
                              ? 'bg-violet-500/20 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                              : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon size={22} className={isActive ? 'text-violet-300' : ''} />
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      );
                    })}
                </nav>

                {/* Auth Actions */}
                <div className="p-4 border-t border-white/5 space-y-3 relative z-10 bg-black/20">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 transition-all duration-300"
                    >
                      <LogOut size={22} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation('/authentication?mode=login')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        <LogIn size={22} />
                        <span className="font-medium">Sign In</span>
                      </button>
                      <PrismButton
                        onClick={() => handleNavigation('/authentication?mode=signup')}
                        className="w-full justify-center"
                        icon={<UserPlus size={20} />}
                        glow
                      >
                        Get Started
                      </PrismButton>
                    </>
                  )}
                </div>
              </PrismPanel>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;

