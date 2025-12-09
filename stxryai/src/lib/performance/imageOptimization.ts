// Image Optimization Utilities
// Helpers for optimizing image loading and performance

/**
 * Generate optimized image URL with Supabase storage
 */
export function getOptimizedImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  } = {}
): string {
  if (!url) return '';

  // If it's a Supabase storage URL, add transformation parameters
  if (url.includes('supabase.co/storage')) {
    const { width, height, quality = 80, format = 'webp' } = options;
    const params = new URLSearchParams();

    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    if (format) params.append('format', format);

    return `${url}?${params.toString()}`;
  }

  return url;
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Lazy load images with Intersection Observer
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  onLoad?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          image.src = src;
          image.onload = () => {
            image.classList.add('loaded');
            onLoad?.();
          };
          observer.unobserve(image);
        }
      });
    },
    {
      rootMargin: '50px' // Start loading 50px before visible
    }
  );

  observer.observe(img);

  return () => observer.disconnect();
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(color: string = '#e0e0e0'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <rect width="8" height="8" fill="${color}" filter="url(#b)" />
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Responsive image srcset generator
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(baseUrl, { width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  breakpoints: { [key: string]: string } = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw'
  }
): string {
  const entries = Object.entries(breakpoints);
  return entries
    .map(([bp, size], index) => {
      if (index === entries.length - 1) return size;
      return `(min-width: ${bp}) ${size}`;
    })
    .join(', ');
}

/**
 * Check if image format is supported
 */
export function supportsImageFormat(format: 'webp' | 'avif'): boolean {
  if (typeof window === 'undefined') return false;

  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
  }

  return false;
}

/**
 * Get optimal image format
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  if (supportsImageFormat('avif')) return 'avif';
  if (supportsImageFormat('webp')) return 'webp';
  return 'jpeg';
}

/**
 * Calculate aspect ratio padding
 */
export function getAspectRatioPadding(width: number, height: number): string {
  const ratio = (height / width) * 100;
  return `${ratio}%`;
}

/**
 * Image loading strategies
 */
export const ImageLoadingStrategy = {
  EAGER: 'eager', // Load immediately
  LAZY: 'lazy', // Load when near viewport
  PRIORITY: 'priority' // Preload with high priority
} as const;

/**
 * Recommended image sizes for different use cases
 */
export const ImageSizes = {
  AVATAR: { width: 128, height: 128 },
  THUMBNAIL: { width: 320, height: 180 },
  CARD: { width: 640, height: 360 },
  HERO: { width: 1920, height: 1080 },
  COVER: { width: 1280, height: 720 }
} as const;

/**
 * Compress image quality based on viewport size
 */
export function getAdaptiveQuality(): number {
  if (typeof window === 'undefined') return 80;

  const width = window.innerWidth;

  if (width < 768) return 70; // Mobile
  if (width < 1440) return 80; // Tablet/Laptop
  return 90; // Desktop
}
