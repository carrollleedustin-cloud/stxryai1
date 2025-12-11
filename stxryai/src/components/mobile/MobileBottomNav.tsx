'use client';

import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

interface MobileBottomNavProps {
  items?: NavItem[];
  variant?: 'default' | 'floating';
}

const defaultItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { id: 'discover', label: 'Discover', icon: '🔍', path: '/discover' },
  { id: 'create', label: 'Create', icon: '✍️', path: '/create' },
  { id: 'library', label: 'Library', icon: '📚', path: '/library' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
];

export default function MobileBottomNav({
  items = defaultItems,
  variant = 'default',
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const handleNavigation = (path: string, id: string) => {
    setPressedItem(id);
    setTimeout(() => {
      router.push(path);
      setPressedItem(null);
    }, 150);
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none md:hidden">
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl pointer-events-auto"
        >
          <div className="flex items-center justify-around px-2 py-3">
            {items.map((item) => (
              <NavButton
                key={item.id}
                item={item}
                isActive={pathname === item.path}
                isPressed={pressedItem === item.id}
                onClick={() => handleNavigation(item.path, item.id)}
              />
            ))}
          </div>
        </motion.nav>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 md:hidden">
      <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={pathname === item.path}
            isPressed={pressedItem === item.id}
            onClick={() => handleNavigation(item.path, item.id)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({
  item,
  isActive,
  isPressed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  isPressed: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all ${
        isActive ? 'text-white' : 'text-gray-400'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-xl"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}

      {/* Pressed indicator */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 bg-white/10 rounded-xl"
        />
      )}

      <div className="relative z-10">
        <div className="text-2xl mb-0.5 relative">
          {item.icon}
          {item.badge !== undefined && item.badge > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {item.badge > 9 ? '9+' : item.badge}
            </motion.div>
          )}
        </div>
        <div className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
          {item.label}
        </div>
      </div>
    </motion.button>
  );
}

// Safe area inset support for notched devices
export function MobileBottomNavSpacer() {
  return <div className="h-20 md:hidden" />;
}
