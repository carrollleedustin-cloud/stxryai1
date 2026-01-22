#!/usr/bin/env node

/**
 * STXRYAI Admin User Creation Script
 * 
 * This script creates or updates a user to have admin privileges.
 * 
 * Usage:
 *   node scripts/create-admin-user.js <email>
 * 
 * Example:
 *   node scripts/create-admin-user.js your.email@example.com
 * 
 * Prerequisites:
 *   - Database initialized
 *   - Supabase connection configured in .env.local
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key (has admin privileges)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createOrUpdateAdminUser(email) {
  console.log('='.repeat(60));
  console.log('STXRYAI Admin User Setup');
  console.log('='.repeat(60));
  console.log();
  
  if (!email) {
    console.error('❌ Error: Email address required');
    console.log('\nUsage: node scripts/create-admin-user.js <email>');
    console.log('Example: node scripts/create-admin-user.js your.email@example.com');
    process.exit(1);
  }
  
  console.log(`Setting up admin user for: ${email}`);
  console.log();
  
  try {
    // Check if user exists in auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth users:', authError.message);
      process.exit(1);
    }
    
    let authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      console.log('User not found in auth.');
      console.log('❌ Please sign up on the platform first, then run this script.');
      console.log('   Or the user might be registered with a different email.');
      process.exit(1);
    }
    
    console.log('✓ Found existing auth user');
    
    // Update user metadata to include admin role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      {
        user_metadata: {
          ...authUser.user_metadata,
          role: 'admin',
          is_admin: true
        }
      }
    );
    
    if (updateError) {
      console.error('❌ Error updating auth user:', updateError.message);
    } else {
      console.log('✓ Updated auth user metadata');
    }
    
    // Check if user exists in users table
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Error checking users table:', dbError.message);
    }
    
    if (!dbUser) {
      console.log('Creating user profile in database...');
      
      // Create user profile
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: email,
          username: email.split('@')[0],
          role: 'admin',
          is_admin: true,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('❌ Error creating user profile:', insertError.message);
      } else {
        console.log('✓ Created user profile');
      }
    } else {
      console.log('Updating existing user profile...');
      
      // Update existing user to admin
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (updateError) {
        console.error('❌ Error updating user profile:', updateError.message);
      } else {
        console.log('✓ Updated user profile to admin');
      }
    }
    
    console.log();
    console.log('='.repeat(60));
    console.log('✅ Admin user setup complete!');
    console.log('='.repeat(60));
    console.log();
    console.log('User Details:');
    console.log(`  Email: ${email}`);
    console.log(`  User ID: ${authUser.id}`);
    console.log(`  Role: admin`);
    console.log();
    console.log('Next Steps:');
    console.log('  1. Login to the platform with this email');
    console.log('  2. Check your email for password reset link (if new user)');
    console.log('  3. You now have admin privileges');
    console.log('  4. You can now run: node scripts/import-starter-stories.js');
    console.log();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'Stonedape710@gmail.com';

if (!process.argv[2]) {
  console.log('No email provided, using default: Stonedape710@gmail.com');
  console.log('To use a different email, run: node scripts/create-admin-user.js your.email@example.com');
  console.log();
}

createOrUpdateAdminUser(email).catch(console.error);
