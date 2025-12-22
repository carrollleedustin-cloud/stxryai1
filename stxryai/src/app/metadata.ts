import type { Metadata } from 'next';

/**
 * Centralized metadata configuration for StxryAI
 * Provides default metadata with Open Graph and Twitter Cards
 */

// Safely get base URL with validation
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  // Validate URL format
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      new URL(url); // Validate it's a proper URL
      return url;
    } catch {
      // Invalid URL, use fallback
    }
  }
  // Fallback to production URL
  return 'https://stxryai.com';
}

const baseUrl = getBaseUrl();
const siteName = 'StxryAI';
const defaultTitle = 'StxryAI - AI-Powered Interactive Fiction Platform';
const defaultDescription =
  'Experience AI-generated interactive stories where your choices shape infinite narrative possibilities. Join thousands of readers exploring unique story branches with real-time AI generation, social features, and unlimited creative freedom.';

const defaultImage = `${baseUrl}/assets/images/og-image.png`; // You may want to create this image

/**
 * Creates comprehensive metadata with Open Graph and Twitter Cards
 */
export function createMetadata(options: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const {
    title = defaultTitle,
    description = defaultDescription,
    image = defaultImage,
    url = baseUrl,
    type = 'website',
    noIndex = false,
  } = options;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  // Safely create URL object with fallback
  let metadataBaseUrl: URL;
  try {
    metadataBaseUrl = new URL(baseUrl);
  } catch {
    // Fallback to production URL if baseUrl is invalid
    metadataBaseUrl = new URL('https://stxryai.com');
  }

  return {
    title: fullTitle,
    description,
    metadataBase: metadataBaseUrl,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@stxryai', // Update with your Twitter handle
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Default metadata for the root layout
 */
export const defaultMetadata: Metadata = createMetadata({
  title: defaultTitle,
  description: defaultDescription,
});

