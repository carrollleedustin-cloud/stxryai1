import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * THEME CONTEXT
 * Manages theme state (dark/light mode, custom themes).
 */

type ThemeMode = 'dark' | 'light' | 'kids';

interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  elevated: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accents
  primary: string;
  secondary: string;
  accent: string;
  
  // States
  success: string;
  warning: string;
  error: string;
  
  // Borders
  border: string;
  borderHover: string;
}

const themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    background: '#000000',
    surface: '#0a0a14',
    elevated: '#14142a',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.4)',
    primary: '#00ffd5',
    secondary: '#9b5de5',
    accent: '#f15bb5',
    success: '#00f5d4',
    warning: '#fee440',
    error: '#ff4080',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
  },
  light: {
    background: '#f8f8ff',
    surface: '#ffffff',
    elevated: '#ffffff',
    text: '#1a1a2e',
    textSecondary: 'rgba(26, 26, 46, 0.7)',
    textTertiary: 'rgba(26, 26, 46, 0.4)',
    primary: '#00c4a7',
    secondary: '#7b2cbf',
    accent: '#d81b60',
    success: '#00a884',
    warning: '#f59e0b',
    error: '#dc2626',
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
  },
  kids: {
    background: '#1a1a2e',
    surface: '#16213e',
    elevated: '#1f3460',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    primary: '#00f5d4',
    secondary: '#9b5de5',
    accent: '#f15bb5',
    success: '#40ff80',
    warning: '#fee440',
    error: '#ff6b6b',
    border: 'rgba(155, 93, 229, 0.2)',
    borderHover: 'rgba(155, 93, 229, 0.4)',
  },
};

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  
  const toggleMode = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  return (
    <ThemeContext.Provider
      value={{
        mode,
        colors: themes[mode],
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;


