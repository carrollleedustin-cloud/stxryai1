import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Configure DOMPurify for server-side usage
const window = new JSDOM('').window;
const DOMPurifyServer = DOMPurify(window as any);

export interface SanitizationOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowHtml?: boolean;
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string, options: SanitizationOptions = {}): string {
  if (!options.allowHtml) {
    // If HTML is not allowed, just escape and return plain text
    return escapeHtml(dirty);
  }

  const config = {
    ALLOWED_TAGS: options.allowedTags || ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: options.allowedAttributes || {
      a: ['href', 'target', 'rel'],
    },
  };

  return DOMPurifyServer.sanitize(dirty, config);
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  const div = window.document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeForDatabase(input: string): string {
  // Remove null bytes and other dangerous characters
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validate and sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.toLowerCase().trim();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  return sanitized;
}

/**
 * Sanitize usernames (remove special characters, limit length)
 */
export function sanitizeUsername(username: string): string {
  return username
    .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, dash
    .substring(0, 50) // Limit length
    .trim();
}

/**
 * Sanitize story content
 */
export function sanitizeStoryContent(content: string): string {
  return sanitizeHtml(content, {
    allowHtml: true,
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'blockquote', 'ul', 'ol', 'li'],
  });
}

/**
 * Check for suspicious content patterns
 */
export function containsSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}
