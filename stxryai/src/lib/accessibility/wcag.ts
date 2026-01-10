/**
 * WCAG 2.1 Accessibility Utilities
 * Provides utilities for ensuring WCAG 2.1 AA compliance
 */

// ============================================================================
// COLOR CONTRAST UTILITIES
// ============================================================================

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

// ============================================================================
// ARIA UTILITIES
// ============================================================================

/**
 * Generate unique ID for ARIA attributes
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create ARIA label from text content
 */
export function createAriaLabel(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Get ARIA role for element type
 */
export function getAriaRole(elementType: string): string {
  const roleMap: Record<string, string> = {
    button: 'button',
    link: 'link',
    heading: 'heading',
    list: 'list',
    listitem: 'listitem',
    navigation: 'navigation',
    main: 'main',
    article: 'article',
    section: 'region',
    aside: 'complementary',
    footer: 'contentinfo',
    header: 'banner',
  };

  return roleMap[elementType] || '';
}

// ============================================================================
// KEYBOARD NAVIGATION UTILITIES
// ============================================================================

/**
 * Check if element is focusable
 */
export function isFocusable(element: HTMLElement): boolean {
  const focusableElements = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];

  return focusableElements.some((selector) => element.matches(selector));
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors));
}

/**
 * Trap focus within a container (for modals, dialogs)
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// ============================================================================
// SCREEN READER UTILITIES
// ============================================================================

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  if (typeof document === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Create visually hidden element for screen readers
 */
export function createScreenReaderOnly(text: string): HTMLElement {
  const element = document.createElement('span');
  element.className = 'sr-only';
  element.textContent = text;
  return element;
}

// ============================================================================
// FORM ACCESSIBILITY UTILITIES
// ============================================================================

/**
 * Associate label with input
 */
export function associateLabelWithInput(labelId: string, inputId: string): void {
  const label = document.getElementById(labelId);
  const input = document.getElementById(inputId);

  if (label && input) {
    label.setAttribute('for', inputId);
    input.setAttribute('aria-labelledby', labelId);
  }
}

/**
 * Add error message to input
 */
export function addErrorToInput(inputId: string, errorMessage: string): void {
  const input = document.getElementById(inputId);
  if (!input) return;

  const errorId = `${inputId}-error`;
  let errorElement = document.getElementById(errorId);

  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = errorId;
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    input.parentNode?.insertBefore(errorElement, input.nextSibling);
  }

  errorElement.textContent = errorMessage;
  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby', errorId);
}

/**
 * Remove error message from input
 */
export function removeErrorFromInput(inputId: string): void {
  const input = document.getElementById(inputId);
  if (!input) return;

  const errorId = `${inputId}-error`;
  const errorElement = document.getElementById(errorId);

  if (errorElement) {
    errorElement.remove();
  }

  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

// ============================================================================
// HEADING HIERARCHY UTILITIES
// ============================================================================

/**
 * Validate heading hierarchy
 */
export function validateHeadingHierarchy(container: HTMLElement): string[] {
  const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const errors: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));

    if (index === 0 && level !== 1) {
      errors.push('First heading should be h1');
    }

    if (level > previousLevel + 1) {
      errors.push(`Heading level skipped: ${heading.tagName} after h${previousLevel}`);
    }

    previousLevel = level;
  });

  return errors;
}

// ============================================================================
// SKIP NAVIGATION UTILITIES
// ============================================================================

/**
 * Create skip navigation link
 */
export function createSkipLink(
  targetId: string,
  text: string = 'Skip to main content'
): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.className = 'skip-link';
  skipLink.textContent = text;

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  return skipLink;
}

// ============================================================================
// LANDMARK UTILITIES
// ============================================================================

/**
 * Validate landmark regions
 */
export function validateLandmarks(container: HTMLElement): string[] {
  const errors: string[] = [];

  // Check for main landmark
  const mainLandmarks = container.querySelectorAll('main, [role="main"]');
  if (mainLandmarks.length === 0) {
    errors.push('Missing main landmark');
  } else if (mainLandmarks.length > 1) {
    errors.push('Multiple main landmarks found');
  }

  // Check for navigation landmark
  const navLandmarks = container.querySelectorAll('nav, [role="navigation"]');
  if (navLandmarks.length === 0) {
    errors.push('Missing navigation landmark');
  }

  return errors;
}

// ============================================================================
// ALT TEXT UTILITIES
// ============================================================================

/**
 * Validate image alt text
 */
export function validateImageAltText(container: HTMLElement): string[] {
  const errors: string[] = [];
  const images = Array.from(container.querySelectorAll('img'));

  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      errors.push(`Image ${index + 1} missing alt attribute`);
    } else if (img.getAttribute('alt') === '') {
      // Empty alt is okay for decorative images
      if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
        errors.push(`Image ${index + 1} has empty alt but is not marked as decorative`);
      }
    }
  });

  return errors;
}

// ============================================================================
// FOCUS MANAGEMENT UTILITIES
// ============================================================================

/**
 * Set focus to element with announcement
 */
export function setFocusWithAnnouncement(elementId: string, announcement?: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.focus();

  if (announcement) {
    announceToScreenReader(announcement);
  }
}

/**
 * Restore focus to previous element
 */
export function createFocusRestorer(): () => void {
  const previouslyFocused = document.activeElement as HTMLElement;

  return () => {
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  };
}

// ============================================================================
// ACCESSIBILITY AUDIT
// ============================================================================

/**
 * Run comprehensive accessibility audit
 */
export function runAccessibilityAudit(container: HTMLElement = document.body): {
  errors: string[];
  warnings: string[];
  passed: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  // Check heading hierarchy
  const headingErrors = validateHeadingHierarchy(container);
  if (headingErrors.length > 0) {
    errors.push(...headingErrors);
  } else {
    passed.push('Heading hierarchy is correct');
  }

  // Check landmarks
  const landmarkErrors = validateLandmarks(container);
  if (landmarkErrors.length > 0) {
    errors.push(...landmarkErrors);
  } else {
    passed.push('Landmark regions are correct');
  }

  // Check image alt text
  const altTextErrors = validateImageAltText(container);
  if (altTextErrors.length > 0) {
    warnings.push(...altTextErrors);
  } else {
    passed.push('All images have alt text');
  }

  // Check for skip link
  const skipLink = container.querySelector('.skip-link');
  if (!skipLink) {
    warnings.push('Missing skip navigation link');
  } else {
    passed.push('Skip navigation link present');
  }

  return { errors, warnings, passed };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize accessibility features
 */
export function initializeAccessibility(): void {
  if (typeof document === 'undefined') return;

  // Add skip link if not present
  const skipLink = document.querySelector('.skip-link');
  if (!skipLink) {
    const main = document.querySelector('main');
    if (main && !main.id) {
      main.id = 'main-content';
    }
    if (main?.id) {
      const link = createSkipLink(main.id);
      document.body.insertBefore(link, document.body.firstChild);
    }
  }

  // Run audit in development
  if (process.env.NODE_ENV === 'development') {
    const audit = runAccessibilityAudit();
    if (audit.errors.length > 0 || audit.warnings.length > 0) {
      console.group('♿ Accessibility Audit');
      if (audit.errors.length > 0) {
        console.error('Errors:', audit.errors);
      }
      if (audit.warnings.length > 0) {
        console.warn('Warnings:', audit.warnings);
      }
      console.log('Passed:', audit.passed);
      console.groupEnd();
    }
  }
}
