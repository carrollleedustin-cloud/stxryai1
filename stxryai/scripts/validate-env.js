/**
 * Pre-build environment validation script.
 * Ensures required environment variables are set before building.
 * Run automatically via npm prebuild hook.
 */

const fs = require('fs');
const path = require('path');

// Load .env.local file if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      // Skip comments and empty lines
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          // Only set if not already in process.env (allows overrides)
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

// Load environment variables from .env.local
loadEnvFile();

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalEnvVars = [
  { name: 'SUPABASE_SERVICE_ROLE_KEY', feature: 'Server-side Supabase operations' },
  { name: 'STRIPE_SECRET_KEY', feature: 'Stripe payments' },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', feature: 'Stripe checkout' },
  { name: 'OPEN_AI_SECRET_KEY', feature: 'AI story generation' },
  { name: 'SENDGRID_API_KEY', feature: 'Email notifications (SendGrid)' },
  { name: 'NEXT_PUBLIC_POSTHOG_KEY', feature: 'Analytics' },
  { name: 'NEXT_PUBLIC_GA_MEASUREMENT_ID', feature: 'Google Analytics' },
];

function validateEnvironment() {
  console.log('\n🔍 Validating environment variables...\n');

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    } else {
      console.log(`  ✅ ${envVar}`);
    }
  }

  // Check optional variables
  console.log('\n📋 Optional features:');
  for (const { name, feature } of optionalEnvVars) {
    if (!process.env[name]) {
      warnings.push({ name, feature });
      console.log(`  ⚠️  ${name} - ${feature} (disabled)`);
    } else {
      console.log(`  ✅ ${name} - ${feature}`);
    }
  }

  // Report results
  console.log('\n');

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nPlease set these variables in your Netlify dashboard or .env.local file.\n');

    // Don't fail build on Netlify if env vars might be set there
    if (process.env.NETLIFY) {
      console.warn('⚠️  Running on Netlify - environment variables may be set in dashboard.\n');
    } else {
      process.exit(1);
    }
  }

  if (warnings.length > 0 && !process.env.CI) {
    console.warn('⚠️  Some optional features are disabled due to missing environment variables.');
    console.warn('   This is fine for development but may limit functionality in production.\n');
  }

  console.log('✅ Environment validation complete!\n');
}

// Run validation
validateEnvironment();
