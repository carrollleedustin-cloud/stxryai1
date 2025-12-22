#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * Run this script to check which environment variables are set and which are missing.
 * Usage: node scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');

// Required variables (app won't work without these)
const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

// Recommended variables (highly recommended)
const RECOMMENDED = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
];

// Optional variables (features work without, but better with)
const OPTIONAL = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PREMIUM_PRICE_ID',
  'STRIPE_CREATOR_PRO_PRICE_ID',
  'OPEN_AI_SECRET_KEY',
  'OPEN_AI_SERVICE_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
  'NEXT_PUBLIC_ADSENSE_CLIENT',
  'NEXT_PUBLIC_ADSENSE_ID',
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function checkVariable(name) {
  const value = process.env[name];
  if (!value) {
    return { set: false, value: null };
  }
  // Mask sensitive values
  if (name.includes('SECRET') || name.includes('KEY') || name.includes('TOKEN')) {
    const masked = value.length > 8 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : '***';
    return { set: true, value: masked };
  }
  return { set: true, value: value.length > 50 ? `${value.substring(0, 50)}...` : value };
}

function validateFormat(name, value) {
  if (!value) return { valid: false, reason: 'Not set' };
  
  const validations = {
    'NEXT_PUBLIC_SUPABASE_URL': (v) => v.startsWith('https://') && v.includes('.supabase.co'),
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': (v) => v.startsWith('eyJ'),
    'SUPABASE_SERVICE_ROLE_KEY': (v) => v.startsWith('eyJ'),
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': (v) => v.startsWith('pk_test_') || v.startsWith('pk_live_'),
    'STRIPE_SECRET_KEY': (v) => v.startsWith('sk_test_') || v.startsWith('sk_live_'),
    'OPEN_AI_SECRET_KEY': (v) => v.startsWith('sk-'),
    'RESEND_API_KEY': (v) => v.startsWith('re_'),
    'NEXT_PUBLIC_POSTHOG_KEY': (v) => v.startsWith('phc_'),
    'NEXT_PUBLIC_GA_MEASUREMENT_ID': (v) => v.startsWith('G-'),
    'NEXT_PUBLIC_ADSENSE_CLIENT': (v) => v.startsWith('ca-pub-'),
  };
  
  const validator = validations[name];
  if (!validator) return { valid: true, reason: null };
  
  const valid = validator(value);
  return { 
    valid, 
    reason: valid ? null : 'Invalid format' 
  };
}

function main() {
  console.log(colorize('\n🔍 Environment Variables Checker\n', 'cyan'));
  console.log(colorize('Checking environment variables...\n', 'blue'));
  
  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const hasEnvLocal = fs.existsSync(envLocalPath);
  
  if (hasEnvLocal) {
    console.log(colorize('✅ Found .env.local file', 'green'));
    // Load .env.local (simple parsing, doesn't handle all edge cases)
    try {
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value.trim();
          }
        }
      });
    } catch (error) {
      console.log(colorize('⚠️  Could not parse .env.local', 'yellow'));
    }
  } else {
    console.log(colorize('⚠️  No .env.local file found', 'yellow'));
    console.log(colorize('   Create one from .env.local.example\n', 'yellow'));
  }
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required
  console.log(colorize('📋 REQUIRED (App won\'t work without these):', 'red'));
  REQUIRED.forEach(name => {
    const check = checkVariable(name);
    const validation = validateFormat(name, process.env[name]);
    
    if (!check.set) {
      console.log(`  ❌ ${name} - ${colorize('NOT SET', 'red')}`);
      hasErrors = true;
    } else if (!validation.valid) {
      console.log(`  ⚠️  ${name} - ${colorize('INVALID FORMAT', 'yellow')} (${validation.reason})`);
      console.log(`     Current: ${check.value}`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${name} - ${colorize('SET', 'green')} (${check.value})`);
    }
  });
  
  console.log();
  
  // Check recommended
  console.log(colorize('📋 RECOMMENDED (Highly recommended):', 'yellow'));
  RECOMMENDED.forEach(name => {
    const check = checkVariable(name);
    const validation = validateFormat(name, process.env[name]);
    
    if (!check.set) {
      console.log(`  ⚠️  ${name} - ${colorize('NOT SET', 'yellow')}`);
      hasWarnings = true;
    } else if (!validation.valid) {
      console.log(`  ⚠️  ${name} - ${colorize('INVALID FORMAT', 'yellow')} (${validation.reason})`);
      hasWarnings = true;
    } else {
      console.log(`  ✅ ${name} - ${colorize('SET', 'green')} (${check.value})`);
    }
  });
  
  console.log();
  
  // Check optional
  console.log(colorize('📋 OPTIONAL (Features work without, but better with):', 'blue'));
  const optionalSet = OPTIONAL.filter(name => {
    const check = checkVariable(name);
    return check.set;
  });
  
  if (optionalSet.length === 0) {
    console.log('  ℹ️  No optional variables set');
  } else {
    optionalSet.forEach(name => {
      const check = checkVariable(name);
      console.log(`  ✅ ${name} - ${colorize('SET', 'green')} (${check.value})`);
    });
  }
  
  const optionalMissing = OPTIONAL.filter(name => !checkVariable(name).set);
  if (optionalMissing.length > 0) {
    console.log(`  ℹ️  ${optionalMissing.length} optional variables not set (this is OK)`);
  }
  
  console.log();
  
  // Summary
  console.log(colorize('📊 Summary:', 'cyan'));
  const requiredSet = REQUIRED.filter(name => checkVariable(name).set).length;
  const recommendedSet = RECOMMENDED.filter(name => checkVariable(name).set).length;
  const optionalSetCount = OPTIONAL.filter(name => checkVariable(name).set).length;
  
  console.log(`  Required: ${requiredSet}/${REQUIRED.length} set`);
  console.log(`  Recommended: ${recommendedSet}/${RECOMMENDED.length} set`);
  console.log(`  Optional: ${optionalSetCount}/${OPTIONAL.length} set`);
  
  console.log();
  
  if (hasErrors) {
    console.log(colorize('❌ ERRORS FOUND - App may not work correctly!', 'red'));
    console.log(colorize('   Fix the required variables above.\n', 'red'));
    process.exit(1);
  } else if (hasWarnings) {
    console.log(colorize('⚠️  WARNINGS - Some recommended variables are missing', 'yellow'));
    console.log(colorize('   App will work, but some features may be limited.\n', 'yellow'));
    process.exit(0);
  } else {
    console.log(colorize('✅ All required and recommended variables are set!', 'green'));
    console.log();
    process.exit(0);
  }
}

// Run the check
main();

