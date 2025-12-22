import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

/**
 * Dynamic sitemap generation for StxryAI
 * Next.js 14 App Router automatically serves this at /sitemap.xml
 * 
 * Uses actual lastModified dates from the database to prevent unnecessary recrawls.
 * This ensures search engines only recrawl when content actually changes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stxryai.com';
  
  // Get the most recent story update date for dynamic pages
  // This represents when story content was last actually modified
  let mostRecentStoryUpdate: Date | null = null;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('stories')
      .select('updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (!error && data) {
      const updatedAt = (data as { updated_at: string | null }).updated_at;
      if (updatedAt) {
        mostRecentStoryUpdate = new Date(updatedAt);
      }
    }
  } catch (error) {
    // If database query fails, fall back to a reasonable default
    // This should rarely happen, but we want the sitemap to still work
    console.warn('Failed to fetch story update date for sitemap:', error);
  }

  // Use the most recent story update, or a fallback date if no stories exist
  // Fallback represents when the site was initially launched
  const dynamicContentDate = mostRecentStoryUpdate || new Date('2024-01-01');
  
  // Static pages with fixed lastModified dates
  // IMPORTANT: Update these dates when you actually modify the content of these pages
  // This prevents search engines from unnecessarily recrawling unchanged pages
  const staticPagesDate = new Date('2024-12-01'); // Last time landing/pricing pages were updated
  const legalPagesDate = new Date('2024-01-01'); // Last time terms/privacy/cookies pages were updated

  // Public routes that should be indexed
  const publicRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: dynamicContentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/landing-page`,
      lastModified: staticPagesDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/story-library`,
      lastModified: dynamicContentDate,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: staticPagesDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/community-hub`,
      lastModified: dynamicContentDate,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/forums`,
      lastModified: dynamicContentDate,
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/leaderboards`,
      lastModified: dynamicContentDate,
      changeFrequency: 'hourly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: dynamicContentDate,
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: dynamicContentDate,
      changeFrequency: 'daily',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: staticPagesDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: legalPagesDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: legalPagesDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: legalPagesDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return publicRoutes;
}

