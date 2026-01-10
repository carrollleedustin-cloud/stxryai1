/**
 * PERFORMANCE OPTIMIZATION - LAZY LOADING UTILITIES
 * Advanced code splitting and lazy loading for optimal performance
 */

import { lazy } from 'react';

// Lazy load components with preloading
export const LazyStoryReader = lazy(
  () => import('@/app/story-reader/components/StoryReaderInteractive')
);

export const LazyLandingPage = lazy(
  () => import('@/app/landing-page/components/LandingPageInteractive')
);

export const LazyUserDashboard = lazy(
  () => import('@/app/user-dashboard/components/DashboardInteractive')
);

export const LazyStoryLibrary = lazy(
  () => import('@/app/story-library/components/StoryLibraryInteractive')
);

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload story reader for immediate navigation
  import('@/app/story-reader/components/StoryReaderInteractive');

  // Preload landing page components
  import('@/app/landing-page/components/LandingPageInteractive');

  // Preload user dashboard
  import('@/app/user-dashboard/components/DashboardInteractive');
};

// Lazy load heavy components
export const LazyComponents = {
  // Story Reader Features
  QuantumTextRenderer: lazy(() => import('@/components/story-reader/QuantumTextRenderer')),
  NeuralNetworkBackground: lazy(() => import('@/components/story-reader/NeuralNetworkBackground')),
  ImmersiveSoundscape: lazy(() => import('@/components/story-reader/ImmersiveSoundscape')),
  GestureControls: lazy(() => import('@/components/story-reader/GestureControls')),
  DynamicPacingIndicator: lazy(() => import('@/components/story-reader/DynamicPacingIndicator')),
  AICompanionPanel: lazy(() => import('@/components/story-reader/AICompanionPanel')),

  // Advanced Effects
  HolographicCard: lazy(() =>
    import('@/components/void/AdvancedEffects').then((mod) => ({ default: mod.HolographicCard }))
  ),
  MorphingBlob: lazy(() =>
    import('@/components/void/AdvancedEffects').then((mod) => ({ default: mod.MorphingBlob }))
  ),
  ParticleField: lazy(() =>
    import('@/components/void/ParticleField').then((mod) => ({ default: mod.ParticleField }))
  ),

  // Services (for dynamic imports)
  StoryService: lazy(() => import('@/services/storyService')),
  NotificationService: lazy(() => import('@/services/notificationService')),
  UserProgressService: lazy(() => import('@/services/userProgressService')),
};

// Dynamic imports for heavy operations
export const dynamicImports = {
  // AI Services
  aiCompanionService: () => import('@/services/aiCompanionService'),
  narrativeAIService: () => import('@/services/narrativeAIService'),
  aiStoryAssistantService: () => import('@/services/aiStoryAssistantService'),

  // Analytics
  posthog: () => import('posthog-js'),
  sentry: () => import('@sentry/nextjs'),

  // Payment processing
  stripe: () => import('@stripe/stripe-js'),
  stripeJS: () => import('stripe'),

  // Email service
  sendgrid: () => import('@sendgrid/mail'),

  // File upload
  supabaseStorage: () => import('@supabase/storage-js'),
};

// Preload strategies
export const preloadStrategies = {
  // Preload on user interaction
  onStoryHover: () => {
    import('@/app/story-reader/components/StoryReaderInteractive');
  },

  onDashboardHover: () => {
    import('@/app/user-dashboard/components/DashboardInteractive');
  },

  // Preload on route change
  onRouteChange: (route: string) => {
    switch (route) {
      case '/story-reader':
        import('@/app/story-reader/components/StoryReaderInteractive');
        // Preload story reader features
        import('@/components/story-reader/QuantumTextRenderer');
        import('@/components/story-reader/NeuralNetworkBackground');
        break;
      case '/user-dashboard':
        import('@/app/user-dashboard/components/DashboardInteractive');
        break;
      case '/story-library':
        import('@/app/story-library/components/StoryLibraryInteractive');
        break;
    }
  },

  // Preload based on user behavior
  onUserAction: (action: string) => {
    switch (action) {
      case 'start_reading':
        import('@/components/story-reader/QuantumTextRenderer');
        import('@/components/story-reader/NeuralNetworkBackground');
        import('@/components/story-reader/ImmersiveSoundscape');
        break;
      case 'open_settings':
        import('@/components/story-reader/GestureControls');
        import('@/components/story-reader/DynamicPacingIndicator');
        break;
      case 'enable_ai':
        import('@/components/story-reader/AICompanionPanel');
        import('@/services/aiCompanionService');
        break;
    }
  },
};

// Bundle splitting utilities
export const bundleSplit = {
  // Split by feature
  storyReader: () => import('@/app/story-reader/page'),
  userDashboard: () => import('@/app/user-dashboard/page'),
  storyCreation: () => import('@/app/story-creation-studio/page'),

  // Split by component type
  uiComponents: () => import('@/components/ui'),
  effects: () => import('@/components/void/AdvancedEffects'),
  services: () => import('@/services'),

  // Split by vendor libraries
  framerMotion: () => import('framer-motion'),
  recharts: () => import('recharts'),
  dateFns: () => import('date-fns'),
};

// Resource hints for critical resources
export const resourceHints = {
  // Preconnect to external domains
  preconnect: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://app.supabase.co',
    'https://js.stripe.com',
  ],

  // DNS prefetch for performance
  dnsPrefetch: [
    'https://api.supabase.co',
    'https://cdn.supabase.co',
    'https://posthog.com',
    'https://sentry.io',
  ],

  // Preload critical fonts
  fontPreload: ['/fonts/inter-var.woff2', '/fonts/playfair-display.woff2'],
};

// Performance monitoring
export const performanceMonitor = {
  // Measure component load time
  measureComponentLoad: (componentName: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    console.log(`Component ${componentName} loaded in ${loadTime.toFixed(2)}ms`);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_load', {
        event_category: 'performance',
        event_label: componentName,
        value: Math.round(loadTime),
      });
    }
  },

  // Measure bundle size
  measureBundleSize: (bundleName: string, size: number) => {
    console.log(`Bundle ${bundleName}: ${(size / 1024 / 1024).toFixed(2)}MB`);

    // Alert if bundle is too large
    if (size > 500 * 1024) {
      // 500KB
      console.warn(
        `Bundle ${bundleName} is ${(size / 1024 / 1024).toFixed(2)}MB - consider code splitting`
      );
    }
  },

  // Monitor memory usage
  monitorMemoryUsage: () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      console.log('Memory usage:', {
        used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      });
    }
  },
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined') return null;

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Lazy load with intersection observer
export const lazyLoadOnVisible = (
  importFn: () => Promise<any>,
  element: Element,
  callback?: (module: any) => void
) => {
  const observer = createIntersectionObserver((entry) => {
    if (entry.isIntersecting) {
      importFn().then((module) => {
        callback?.(module);
        observer?.disconnect();
      });
    }
  });

  if (observer && element) {
    observer.observe(element);
  }
};

// Service worker for caching
export const serviceWorkerUtils = {
  register: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  },

  unregister: async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered');
    }
  },
};

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image srcSet
  generateSrcSet: (baseUrl: string, widths: number[] = [320, 640, 1024, 1920]) => {
    return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
  },

  // Generate WebP fallbacks
  generateWebPSrcSet: (baseUrl: string, widths: number[] = [320, 640, 1024, 1920]) => {
    return widths.map((width) => `${baseUrl}?w=${width}&format=webp ${width}w`).join(', ');
  },

  // Lazy load images
  lazyLoadImage: (img: HTMLImageElement) => {
    const observer = createIntersectionObserver((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLImageElement;
        if (target.dataset.src) {
          target.src = target.dataset.src;
          target.classList.remove('lazy');
          observer?.disconnect();
        }
      }
    });

    if (observer) {
      observer.observe(img);
    }
  },
};

export default {
  LazyComponents,
  dynamicImports,
  preloadStrategies,
  bundleSplit,
  resourceHints,
  performanceMonitor,
  serviceWorkerUtils,
  imageOptimization,
};
