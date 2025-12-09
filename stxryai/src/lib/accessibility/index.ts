/**
 * Accessibility Utilities
 * Helpers for improving accessibility and user experience
 */

/**
 * Announce to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Focus management - trap focus within a container
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Get user's preferred color scheme
 */
export function getPreferredColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Skip to main content link
 */
export function scrollToMain(): void {
  const main = document.querySelector('main');
  if (main) {
    main.focus();
    main.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * ARIA live region manager
 */
class LiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();

  getOrCreateRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
    if (this.regions.has(id)) {
      return this.regions.get(id)!;
    }

    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = id;

    document.body.appendChild(region);
    this.regions.set(id, region);

    return region;
  }

  announce(message: string, regionId: string = 'default', priority: 'polite' | 'assertive' = 'polite'): void {
    const region = this.getOrCreateRegion(regionId, priority);
    region.textContent = message;
  }

  clear(regionId: string): void {
    const region = this.regions.get(regionId);
    if (region) {
      region.textContent = '';
    }
  }

  destroy(): void {
    this.regions.forEach((region) => {
      document.body.removeChild(region);
    });
    this.regions.clear();
  }
}

export const liveRegionManager = new LiveRegionManager();

/**
 * Keyboard navigation helpers
 */
export const KeyCodes = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End'
} as const;

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);

  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.getAttribute('aria-hidden') !== 'true'
  );
}

/**
 * Get accessible name of element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check associated label
  if (element instanceof HTMLInputElement) {
    const labels = element.labels;
    if (labels && labels.length > 0) {
      return labels[0].textContent || '';
    }
  }

  // Fallback to text content
  return element.textContent || '';
}

/**
 * Focus indicator utilities
 */
export function addFocusIndicator(element: HTMLElement, className: string = 'focus-visible'): void {
  element.classList.add(className);
}

export function removeFocusIndicator(element: HTMLElement, className: string = 'focus-visible'): void {
  element.classList.remove(className);
}

/**
 * High contrast mode detection and utilities
 */
export function detectHighContrastMode(): 'none' | 'active' | 'black-on-white' | 'white-on-black' {
  if (typeof window === 'undefined') return 'none';

  const testElement = document.createElement('div');
  testElement.style.position = 'absolute';
  testElement.style.top = '-9999px';
  testElement.style.color = 'rgb(255, 255, 255)';
  testElement.style.backgroundColor = 'rgb(0, 0, 0)';
  document.body.appendChild(testElement);

  const styles = window.getComputedStyle(testElement);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;

  document.body.removeChild(testElement);

  if (color !== 'rgb(255, 255, 255)' || backgroundColor !== 'rgb(0, 0, 0)') {
    if (color === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(255, 255, 255)') {
      return 'black-on-white';
    } else if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(0, 0, 0)') {
      return 'white-on-black';
    }
    return 'active';
  }

  return 'none';
}

/**
 * Text contrast ratio calculator (WCAG)
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;

    const [r, g, b] = rgb.map(Number).map((val) => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);

  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  } else {
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }
}

/**
 * Accessible notification
 */
export function accessibleNotify(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
): void {
  const priority = type === 'error' ? 'assertive' : 'polite';
  announceToScreenReader(`${type}: ${message}`, priority);
}
