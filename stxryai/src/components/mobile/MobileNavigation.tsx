'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Home, BookOpen, User, Settings, 
  LogOut, LogIn, UserPlus, Sparkles, Compass 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
        className="lg:hidden fixed bottom-6 right-6 z-50 touch-target rounded-full bg-gradient-primary p-4 shadow-glow-lg text-white transition-bounce"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden"
            >
              <div className="h-full glass-light flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg">StxryAI</h2>
                        <p className="text-xs text-muted-foreground">Interactive Stories</p>
                      </div>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.display_name || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto scrollbar-modern p-4 space-y-2">
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
                          className={`w-full flex items-center gap-4 p-4 rounded-xl transition-smooth ${
                            isActive
                              ? 'bg-gradient-primary text-white shadow-glow'
                              : 'bg-card/50 text-foreground hover:bg-card'
                          }`}
                        >
                          <Icon size={22} />
                          <span className="font-medium">{item.label}</span>
                        </motion.button>
                      );
                    })}
                </nav>

                {/* Auth Actions */}
                <div className="p-4 border-t border-border/50 space-y-2">
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/50 text-error hover:bg-card transition-smooth"
                    >
                      <LogOut size={22} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleNavigation('/authentication?mode=login')}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-card/50 text-foreground hover:bg-card transition-smooth"
                      >
                        <LogIn size={22} />
                        <span className="font-medium">Sign In</span>
                      </button>
                      <button
                        onClick={() => handleNavigation('/authentication?mode=signup')}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <UserPlus size={20} />
                        <span>Get Started</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;

