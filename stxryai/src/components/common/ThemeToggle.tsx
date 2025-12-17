'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import Icon from '@/components/ui/AppIcon';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes: Array<{ value: 'light' | 'dark' | 'system'; icon: string; label: string }> = [
    { value: 'light', icon: 'SunIcon', label: 'Light' },
    { value: 'dark', icon: 'MoonIcon', label: 'Dark' },
    { value: 'system', icon: 'ComputerDesktopIcon', label: 'System' },
  ];

  // Don't render until mounted on client
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex gap-2 p-1 bg-muted rounded-lg">
      {themes.map((t) => (
        <motion.button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={`p-2 rounded-md transition-colors ${
            theme === t.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-background text-muted-foreground'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={t.label}
          aria-label={`Switch to ${t.label} theme`}
        >
          <Icon name={t.icon} size={18} />
        </motion.button>
      ))}
    </div>
  );
}
