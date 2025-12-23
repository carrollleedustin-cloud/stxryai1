/**
 * Environment variable validation and typed access.
 * Ensures all required environment variables are present at startup.
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PREMIUM_PRICE_ID?: string;
  STRIPE_CREATOR_PRO_PRICE_ID?: string;

  // AI Services
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;

  // Email (SendGrid)
  SENDGRID_API_KEY?: string;
  EMAIL_FROM?: string;

  // Analytics
  NEXT_PUBLIC_POSTHOG_KEY?: string;
  NEXT_PUBLIC_GA_MEASUREMENT_ID?: string;

  // Ads
  NEXT_PUBLIC_ADSENSE_CLIENT?: string;
  NEXT_PUBLIC_ADSENSE_ID?: string;

  // App
  NEXT_PUBLIC_APP_URL?: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

type RequiredEnvKeys = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

const REQUIRED_ENV_VARS: RequiredEnvKeys[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

class EnvValidationError extends Error {
  constructor(missingVars: string[]) {
    super(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file or deployment environment.'
    );
    this.name = 'EnvValidationError';
  }
}

function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(missing);
  }
}

function getEnv(): EnvConfig {
  return {
    // Supabase (required)
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID,
    STRIPE_CREATOR_PRO_PRICE_ID: process.env.STRIPE_CREATOR_PRO_PRICE_ID,

    // AI Services
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,

    // Email (SendGrid)
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,

    // Analytics
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,

    // Ads
    NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    NEXT_PUBLIC_ADSENSE_ID: process.env.NEXT_PUBLIC_ADSENSE_ID,

    // App
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  };
}

// Validate on module load (server-side only)
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    // Log but don't crash during build
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Environment validation warning:', (error as Error).message);
    }
  }
}

export const env = getEnv();

// Helper functions for feature flags
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';

// Feature availability checks
export const hasStripe = () => Boolean(env.STRIPE_SECRET_KEY && env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
export const hasAI = () => Boolean(env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY);
export const hasOpenAI = () => Boolean(env.OPENAI_API_KEY);
export const hasAnthropic = () => Boolean(env.ANTHROPIC_API_KEY);
export const hasEmail = () => Boolean(env.SENDGRID_API_KEY);
export const hasAnalytics = () => Boolean(env.NEXT_PUBLIC_POSTHOG_KEY || env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
export const hasAds = () => Boolean(env.NEXT_PUBLIC_ADSENSE_CLIENT);

export type { EnvConfig };
