#!/usr/bin/env node

/**
 * Prepare Environment Variables for Netlify
 * 
 * This script reads your .env.local file and creates a formatted list
 * of environment variables ready to add to Netlify.
 * 
 * Usage: node scripts/prepare-netlify-env.js
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function parseEnvFile(filePath) {
  const envVars = {};
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    
    // Parse KEY=VALUE
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      // Only include if value is not empty and not a placeholder
      if (value && !value.includes('your-') && !value.includes('YOUR-')) {
        envVars[key] = value;
      }
    }
  }
  
  return envVars;
}

function categorizeVariables(envVars) {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  const recommended = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  const optional = [
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
  
  const categorized = {
    required: [],
    recommended: [],
    optional: [],
    other: [],
  };
  
  for (const [key, value] of Object.entries(envVars)) {
    const entry = { key, value };
    
    if (required.includes(key)) {
      categorized.required.push(entry);
    } else if (recommended.includes(key)) {
      categorized.recommended.push(entry);
    } else if (optional.includes(key)) {
      categorized.optional.push(entry);
    } else {
      categorized.other.push(entry);
    }
  }
  
  return categorized;
}

function maskValue(value, showLength = true) {
  if (!value) return '***';
  if (value.length <= 8) return '***';
  const masked = `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
  return showLength ? `${masked} (${value.length} chars)` : masked;
}

function main() {
  console.log(colorize('\n🚀 Netlify Environment Variables Setup Helper\n', 'cyan'));
  
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envVars = parseEnvFile(envLocalPath);
  
  if (!envVars) {
    console.log(colorize('❌ Error: .env.local file not found!', 'red'));
    console.log(colorize('   Make sure you\'ve created .env.local with your variables.\n', 'yellow'));
    process.exit(1);
  }
  
  if (Object.keys(envVars).length === 0) {
    console.log(colorize('⚠️  No environment variables found in .env.local', 'yellow'));
    console.log(colorize('   Make sure your variables are set and not just placeholders.\n', 'yellow'));
    process.exit(1);
  }
  
  const categorized = categorizeVariables(envVars);
  
  console.log(colorize('📋 Found Environment Variables:\n', 'blue'));
  
  // Display categorized
  if (categorized.required.length > 0) {
    console.log(colorize('🔴 REQUIRED:', 'red'));
    categorized.required.forEach(({ key, value }) => {
      console.log(`  ✅ ${key} = ${maskValue(value)}`);
    });
    console.log();
  }
  
  if (categorized.recommended.length > 0) {
    console.log(colorize('🟡 RECOMMENDED:', 'yellow'));
    categorized.recommended.forEach(({ key, value }) => {
      console.log(`  ✅ ${key} = ${maskValue(value)}`);
    });
    console.log();
  }
  
  if (categorized.optional.length > 0) {
    console.log(colorize('🟢 OPTIONAL:', 'green'));
    categorized.optional.forEach(({ key, value }) => {
      console.log(`  ✅ ${key} = ${maskValue(value)}`);
    });
    console.log();
  }
  
  if (categorized.other.length > 0) {
    console.log(colorize('ℹ️  OTHER:', 'blue'));
    categorized.other.forEach(({ key, value }) => {
      console.log(`  ✅ ${key} = ${maskValue(value)}`);
    });
    console.log();
  }
  
  // Create formatted output for Netlify
  console.log(colorize('📝 Step-by-Step Instructions:\n', 'cyan'));
  console.log('1. Go to: https://app.netlify.com');
  console.log('2. Select your site');
  console.log('3. Go to: Site settings → Environment variables');
  console.log('4. Click "Add a variable" for each variable below\n');
  
  console.log(colorize('📋 Variables to Add (copy each one):\n', 'cyan'));
  
  const allVars = [
    ...categorized.required,
    ...categorized.recommended,
    ...categorized.optional,
    ...categorized.other,
  ];
  
  allVars.forEach(({ key, value }, index) => {
    console.log(colorize(`\n${index + 1}. ${key}`, 'yellow'));
    console.log(`   Key: ${key}`);
    console.log(`   Value: ${value}`);
    console.log(`   Scope: All scopes (or leave default)`);
  });
  
  // Create a JSON file for reference
  const outputPath = path.join(process.cwd(), 'netlify-env-vars.json');
  const outputData = {
    note: 'This file contains your environment variables for Netlify. DO NOT commit this file!',
    variables: allVars.map(({ key, value }) => ({ key, value })),
    generated: new Date().toISOString(),
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(colorize(`\n\n💾 Reference file created: netlify-env-vars.json`, 'green'));
  console.log(colorize('   ⚠️  DO NOT commit this file to git!', 'yellow'));
  console.log(colorize('   This file is for your reference only.\n', 'yellow'));
  
  // Special notes
  console.log(colorize('⚠️  Important Notes:\n', 'yellow'));
  console.log('• For production, use PRODUCTION keys (not test keys)');
  console.log('• NEXT_PUBLIC_APP_URL should be your production domain');
  console.log('• Make sure STRIPE keys match your Stripe account mode (test vs live)');
  console.log('• After adding variables, trigger a new deploy\n');
  
  console.log(colorize('✅ Ready to add to Netlify!\n', 'green'));
}

main();

