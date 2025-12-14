// Test authentication directly
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxtjkhphwihroktujzzi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGpraHBod2locm9rdHVqenppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MDU5NjMsImV4cCI6MjA4MDQ4MTk2M30.KesxRh32YnfDngzXKfCIQ1Vb-jjLwQv0kI74hnwN8K0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('Testing authentication...\n');

  // Test 1: Create a test account
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  const testUsername = `testuser${Date.now()}`;

  console.log('1. Creating test account...');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Username: ${testUsername}\n`);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        username: testUsername,
        display_name: 'Test User',
      },
    },
  });

  if (signUpError) {
    console.error('❌ SIGNUP ERROR:', signUpError.message);
    return;
  }

  console.log('✓ Signup successful');
  console.log('   User ID:', signUpData.user?.id);
  console.log('   Email confirmed:', signUpData.user?.email_confirmed_at ? 'YES' : 'NO');
  console.log('   Session created:', signUpData.session ? 'YES' : 'NO');

  // Wait a moment for trigger
  console.log('\n2. Waiting for database trigger to create profile...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Try to sign in immediately
  console.log('\n3. Attempting to sign in...');

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.error('❌ SIGNIN ERROR:', signInError.message);
    console.error('\nThis is the problem! Email confirmation is required.');
    console.error('\nTo fix: Go to Supabase Dashboard → Authentication → Providers → Email');
    console.error('Turn OFF "Confirm email"');
    return;
  }

  console.log('✓ Signin successful');
  console.log('   Session created:', signInData.session ? 'YES' : 'NO');

  // Test 3: Check if profile was created
  console.log('\n4. Checking if user profile exists in database...');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', signUpData.user?.id)
    .single();

  if (profileError) {
    console.error('❌ PROFILE ERROR:', profileError.message);
    return;
  }

  console.log('✓ Profile exists');
  console.log('   Username:', profile.username);
  console.log('   Display name:', profile.display_name);

  console.log('\n✅ ALL TESTS PASSED! Authentication is working correctly.');
}

testAuth().catch(console.error);
