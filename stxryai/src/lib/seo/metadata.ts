/**
 * Advanced SEO & Metadata Management
 * Comprehensive SEO utilities for optimal search engine visibility
 */

import type { Metadata } from 'next';

// ============================================================================
// TYPES
// ============================================================================

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// ============================================================================
// METADATA GENERATION
// ============================================================================

/**
 * Generate comprehensive metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image,
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
  } = config;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stxryai.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image || `${baseUrl}/og-image.png`;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: 'StxryAI',
    publisher: 'StxryAI',
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'StxryAI',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type,
      publishedTime,
      modifiedTime,
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@stxryai',
      site: '@stxryai',
    },

    // Additional
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    },

    // Alternate languages
    alternates: {
      canonical: fullUrl,
    },
  };
}

/**
 * Generate metadata for story page
 */
export function generateStoryMetadata(story: {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  author: string;
  genre: string;
  tags: string[];
  rating: number;
  publishedAt: string;
  updatedAt: string;
}): Metadata {
  return generateMetadata({
    title: `${story.title} by ${story.author} | StxryAI`,
    description: story.description,
    keywords: [story.genre, ...story.tags, 'interactive story', 'fiction'],
    image: story.coverImage,
    url: `/story-reader/${story.id}`,
    type: 'book',
    author: story.author,
    publishedTime: story.publishedAt,
    modifiedTime: story.updatedAt,
  });
}

/**
 * Generate metadata for user profile
 */
export function generateProfileMetadata(user: {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  storyCount: number;
}): Metadata {
  return generateMetadata({
    title: `${user.displayName} (@${user.username}) | StxryAI`,
    description: user.bio || `${user.displayName} has created ${user.storyCount} stories on StxryAI`,
    image: user.avatar,
    url: `/profile/${user.username}`,
    type: 'profile',
    author: user.displayName,
  });
}

// ============================================================================
// STRUCTURED DATA (JSON-LD)
// ============================================================================

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'StxryAI',
    url: 'https://stxryai.com',
    logo: 'https://stxryai.com/logo.png',
    description: 'Interactive storytelling platform powered by AI',
    sameAs: [
      'https://twitter.com/stxryai',
      'https://facebook.com/stxryai',
      'https://instagram.com/stxryai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@stxryai.com',
      contactType: 'Customer Support',
    },
  };
}

/**
 * Generate WebSite structured data
 */
export function generateWebSiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'StxryAI',
    url: 'https://stxryai.com',
    description: 'Create and read interactive stories powered by AI',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://stxryai.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Book structured data for story
 */
export function generateBookSchema(story: {
  id: string;
  title: string;
  description: string;
  author: string;
  genre: string;
  rating: number;
  ratingCount: number;
  publishedAt: string;
  wordCount: number;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: story.title,
    description: story.description,
    author: {
      '@type': 'Person',
      name: story.author,
    },
    genre: story.genre,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: story.rating,
      ratingCount: story.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: story.publishedAt,
    inLanguage: 'en',
    numberOfPages: Math.ceil(story.wordCount / 250), // Approximate
    url: `https://stxryai.com/story-reader/${story.id}`,
  };
}

/**
 * Generate Article structured data for blog post
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  modifiedAt: string;
  image: string;
  url: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    image: article.image,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: 'StxryAI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stxryai.com/logo.png',
      },
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://stxryai.com${crumb.url}`,
    })),
  };
}

// ============================================================================
// SITEMAP GENERATION
// ============================================================================

/**
 * Generate sitemap entry
 */
export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate sitemap for stories
 */
export async function generateStorySitemap(): Promise<SitemapEntry[]> {
  // In production, fetch from database
  // This is a placeholder implementation
  return [
    {
      url: '/story-library',
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stxryai.com';

  return `# StxryAI Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /user-dashboard/
Disallow: /settings/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-stories.xml
Sitemap: ${baseUrl}/sitemap-users.xml

# Crawl delay
Crawl-delay: 1
`;
}

// ============================================================================
// CANONICAL URLS
// ============================================================================

/**
 * Generate canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stxryai.com';
  return `${baseUrl}${path}`;
}

/**
 * Generate alternate language URLs
 */
export function getAlternateUrls(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stxryai.com';

  return {
    'en': `${baseUrl}${path}`,
    'es': `${baseUrl}/es${path}`,
    'fr': `${baseUrl}/fr${path}`,
    'de': `${baseUrl}/de${path}`,
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  generateMetadata,
  generateStoryMetadata,
  generateProfileMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBookSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateStorySitemap,
  generateRobotsTxt,
  getCanonicalUrl,
  getAlternateUrls,
};
