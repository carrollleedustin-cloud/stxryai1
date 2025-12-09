/**
 * Sharing Utilities
 * Share stories across platforms and generate shareable links
 */

export interface ShareData {
  title: string;
  text?: string;
  url: string;
  image?: string;
}

/**
 * Check if Web Share API is supported
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Share using native Web Share API
 */
export async function shareNative(data: ShareData): Promise<boolean> {
  if (!canShare()) {
    return false;
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    });
    return true;
  } catch (error) {
    // User cancelled or error occurred
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Copy link to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return fallbackCopyToClipboard(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback copy to clipboard for older browsers
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (error) {
    document.body.removeChild(textArea);
    return false;
  }
}

/**
 * Generate shareable story URL
 */
export function generateShareableStoryUrl(
  storyId: string,
  options?: {
    chapter?: number;
    referral?: string;
  }
): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(`${baseUrl}/stories/${storyId}`);

  if (options?.chapter) {
    url.searchParams.set('chapter', options.chapter.toString());
  }

  if (options?.referral) {
    url.searchParams.set('ref', options.referral);
  }

  return url.toString();
}

/**
 * Share to specific platforms
 */
export const SharePlatforms = {
  /**
   * Share to Twitter/X
   */
  twitter(data: ShareData): void {
    const text = encodeURIComponent(data.text || data.title);
    const url = encodeURIComponent(data.url);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share to Facebook
   */
  facebook(data: ShareData): void {
    const url = encodeURIComponent(data.url);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share to LinkedIn
   */
  linkedin(data: ShareData): void {
    const url = encodeURIComponent(data.url);
    const title = encodeURIComponent(data.title);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share to Reddit
   */
  reddit(data: ShareData): void {
    const url = encodeURIComponent(data.url);
    const title = encodeURIComponent(data.title);
    window.open(
      `https://reddit.com/submit?url=${url}&title=${title}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share to WhatsApp
   */
  whatsapp(data: ShareData): void {
    const text = encodeURIComponent(`${data.title} ${data.url}`);
    window.open(
      `https://wa.me/?text=${text}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share to Telegram
   */
  telegram(data: ShareData): void {
    const url = encodeURIComponent(data.url);
    const text = encodeURIComponent(data.title);
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      '_blank',
      'width=550,height=420'
    );
  },

  /**
   * Share via Email
   */
  email(data: ShareData): void {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(
      `${data.text || data.title}\n\n${data.url}\n\nShared from StxryAI`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }
};

/**
 * Generate Open Graph meta tags
 */
export function generateOGTags(data: ShareData): Record<string, string> {
  return {
    'og:title': data.title,
    'og:description': data.text || '',
    'og:url': data.url,
    'og:image': data.image || '/og-image.png',
    'og:type': 'article',
    'og:site_name': 'StxryAI',
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title,
    'twitter:description': data.text || '',
    'twitter:image': data.image || '/og-image.png'
  };
}

/**
 * Generate QR code URL for story
 */
export function generateQRCodeUrl(url: string, size: number = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
}

/**
 * Track share event (analytics)
 */
export function trackShare(platform: string, storyId: string): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // Google Analytics
    (window as any).gtag('event', 'share', {
      method: platform,
      content_type: 'story',
      content_id: storyId
    });
  }

  // You can add other analytics here (Mixpanel, Amplitude, etc.)
}

/**
 * Download story as file (for offline reading)
 */
export function downloadStoryAsFile(
  storyTitle: string,
  content: string,
  format: 'txt' | 'html' | 'md' = 'txt'
): void {
  const mimeTypes = {
    txt: 'text/plain',
    html: 'text/html',
    md: 'text/markdown'
  };

  const blob = new Blob([content], { type: mimeTypes[format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${storyTitle}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate referral link with tracking
 */
export function generateReferralLink(userId: string, storyId?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const path = storyId ? `/stories/${storyId}` : '/';
  return `${baseUrl}${path}?ref=${userId}`;
}
