/**
 * Bundle Optimization Utilities
 * Provides utilities for code splitting, lazy loading, and bundle size optimization
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ============================================================================
// DYNAMIC IMPORT UTILITIES
// ============================================================================

/**
 * Create a dynamically imported component with loading state
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    ssr: options?.ssr ?? true,
  });
}

/**
 * Lazy load heavy components only when needed
 */
export const lazyComponents = {
  // Story Reader Components
  StoryReader: createDynamicComponent(
    () => import('@/components/story-reader/QuantumTextRenderer'),
    { ssr: false }
  ),
  
  AICompanionPanel: createDynamicComponent(
    () => import('@/components/story-reader/AICompanionPanel'),
    { ssr: false }
  ),
  
  NeuralNetworkBackground: createDynamicComponent(
    () => import('@/components/story-reader/NeuralNetworkBackground'),
    { ssr: false }
  ),
  
  // Writers Desk Components
  AIWritingStudio: createDynamicComponent(
    () => import('@/app/writers-desk/components/AIWritingStudio'),
    { ssr: false }
  ),
  
  CharacterManager: createDynamicComponent(
    () => import('@/app/writers-desk/components/CharacterManager'),
    { ssr: false }
  ),
  
  // Heavy UI Components
  CommandPalette: createDynamicComponent(
    () => import('@/components/ui/CommandPalette'),
    { ssr: false }
  ),
  
  // Note: Confetti and Analytics components can be added when available
};

// ============================================================================
// ROUTE-BASED CODE SPLITTING
// ============================================================================

/**
 * Preload critical routes for faster navigation
 */
export function preloadRoute(route: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }
}

/**
 * Preload multiple routes
 */
export function preloadRoutes(routes: string[]) {
  routes.forEach(preloadRoute);
}

/**
 * Critical routes to preload on app initialization
 */
export const CRITICAL_ROUTES = [
  '/user-dashboard',
  '/story-library',
  '/story-creation-studio',
];

// ============================================================================
// RESOURCE HINTS
// ============================================================================

/**
 * Add DNS prefetch for external domains
 */
export function addDNSPrefetch(domains: string[]) {
  if (typeof window !== 'undefined') {
    domains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

/**
 * Add preconnect for critical external resources
 */
export function addPreconnect(urls: string[]) {
  if (typeof window !== 'undefined') {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

/**
 * Critical external resources
 */
export const CRITICAL_EXTERNAL_RESOURCES = {
  dnsPrefetch: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
};

// ============================================================================
// BUNDLE ANALYSIS
// ============================================================================

/**
 * Log bundle size information in development
 */
export function logBundleInfo() {
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    // Log performance metrics
    window.addEventListener('load', () => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.group('📊 Performance Metrics');
      console.log(`Page Load Time: ${pageLoadTime}ms`);
      console.log(`Connect Time: ${connectTime}ms`);
      console.log(`Render Time: ${renderTime}ms`);
      console.groupEnd();
    });
  }
}

// ============================================================================
// CHUNK OPTIMIZATION
// ============================================================================

/**
 * Determine if a module should be in the vendor chunk
 */
export function isVendorModule(module: string): boolean {
  return /node_modules/.test(module);
}

/**
 * Determine if a module is a framework module
 */
export function isFrameworkModule(module: string): boolean {
  return /node_modules\/(react|react-dom|scheduler|prop-types)/.test(module);
}

/**
 * Get chunk name for a module
 */
export function getChunkName(module: string): string {
  if (isFrameworkModule(module)) {
    return 'framework';
  }
  
  if (isVendorModule(module)) {
    const match = module.match(/node_modules\/(@[^/]+\/[^/]+|[^/]+)/);
    if (match) {
      return `vendor.${match[1].replace('@', '').replace('/', '-')}`;
    }
    return 'vendor';
  }
  
  return 'main';
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Monitor Core Web Vitals
 */
export function monitorCoreWebVitals() {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1] as any;
    console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
  });
  lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  });
  fidObserver.observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsScore = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
        console.log('CLS:', clsScore);
      }
    });
  });
  clsObserver.observe({ entryTypes: ['layout-shift'] });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize performance optimizations
 */
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return;

  // Add resource hints
  addDNSPrefetch(CRITICAL_EXTERNAL_RESOURCES.dnsPrefetch);
  addPreconnect(CRITICAL_EXTERNAL_RESOURCES.preconnect);

  // Preload critical routes
  preloadRoutes(CRITICAL_ROUTES);

  // Log bundle info in development
  logBundleInfo();

  // Monitor Core Web Vitals
  if (process.env.NODE_ENV === 'production') {
    monitorCoreWebVitals();
  }
}
