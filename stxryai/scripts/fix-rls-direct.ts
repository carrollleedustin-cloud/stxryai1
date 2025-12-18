// Fix RLS policies directly using service role
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxtjkhphwihroktujzzi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('Fixing RLS policies for users table...\n');

  const sql = `
-- Drop old policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Allow users to view all profiles" ON users;

-- Create new SELECT policy that allows all authenticated users to view all profiles
CREATE POLICY "Allow users to view all profiles" ON users
  FOR SELECT TO authenticated
  USING (TRUE);

-- Drop and recreate UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Ensure INSERT policy exists for trigger
DROP POLICY IF EXISTS "Allow user creation via trigger" ON users;
CREATE POLICY "Allow user creation via trigger" ON users
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);
`;

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Error executing SQL:', error);
    console.log('\nTrying alternative approach - running each statement separately...\n');

    // Try each statement separately
    const statements = [
      'DROP POLICY IF EXISTS "Users can view all profiles" ON users',
      'DROP POLICY IF EXISTS "Users can view own profile" ON users',
      'DROP POLICY IF EXISTS "Allow users to view all profiles" ON users',
      'CREATE POLICY "Allow users to view all profiles" ON users FOR SELECT TO authenticated USING (TRUE)',
      'DROP POLICY IF EXISTS "Users can update own profile" ON users',
      'CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id)',
      'DROP POLICY IF EXISTS "Allow user creation via trigger" ON users',
      'CREATE POLICY "Allow user creation via trigger" ON users FOR INSERT TO authenticated WITH CHECK (TRUE)',
    ];

    for (const stmt of statements) {
      const result = await supabase.rpc('exec_sql', { sql_query: stmt });
      if (result.error) {
        console.log(`❌ Failed: ${stmt.substring(0, 50)}...`);
        console.log(`   Error: ${result.error.message}`);
      } else {
        console.log(`✓ ${stmt.substring(0, 50)}...`);
      }
    }
  } else {
    console.log('✓ RLS policies updated successfully');
  }

  console.log('\nDone! Testing if profile can be read now...\n');

  // Test with anon key
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);

  // Sign up test user
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'test123456';

  const { data: authData, error: authError } = await anonClient.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { username: `user${Date.now()}`, display_name: 'Test' },
    },
  });

  if (authError) {
    console.error('Signup failed:', authError.message);
    return;
  }

  console.log('✓ Created test user:', authData.user?.id);

  // Wait for trigger
  await new Promise((r) => setTimeout(r, 2000));

  // Try to read profile
  const { data: profile, error: profileError } = await anonClient
    .from('users')
    .select('*')
    .eq('id', authData.user?.id)
    .single();

  if (profileError) {
    console.error('❌ Still cannot read profile:', profileError.message);
    console.log('\nYou need to run the SQL manually in Supabase SQL Editor.');
    console.log('Go to: https://supabase.com/dashboard → Your Project → SQL Editor');
    console.log('Copy the contents of: supabase/fix-users-rls.sql');
  } else {
    console.log('✅ SUCCESS! Profile can now be read:', profile.username);
  }
}

fixRLS();
