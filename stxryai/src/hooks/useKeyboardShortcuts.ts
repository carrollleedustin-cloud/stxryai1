import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

/**
 * Global keyboard shortcuts hook
 * Manages keyboard shortcuts across the app
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

/**
 * Reading mode keyboard shortcuts
 */
export const readingShortcuts: KeyboardShortcut[] = [
  {
    key: 'ArrowLeft',
    description: 'Previous chapter',
    action: () => {
      // Handled by parent component
    },
  },
  {
    key: 'ArrowRight',
    description: 'Next chapter',
    action: () => {
      // Handled by parent component
    },
  },
  {
    key: 'f',
    description: 'Toggle fullscreen',
    action: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    },
  },
  {
    key: 'b',
    description: 'Bookmark current position',
    action: () => {
      // Handled by parent component
    },
  },
  {
    key: 'n',
    description: 'Toggle night mode',
    action: () => {
      // Handled by parent component
    },
  },
];

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push('Alt');
  if (shortcut.metaKey) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}
